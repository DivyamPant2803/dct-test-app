# Central Inventory - Database Schema Design

## Database Strategy

### **Azure SQL Database** (Primary Structured Data)
- Users, Roles, Permissions
- Transfers, Requirements, Status Tracking
- Evidence Metadata
- Templates, Controls
- Audit Trails
- Notifications
- SLA Configurations

### **Dynamic Data Layer** (SQL JSON Columns)
> **Note**: Replaces NoSQL. We use `NVARCHAR(MAX)` columns to store strictly typed JSON.
- MER Template Filled Data (dynamic schemas)
- Application Metadata Cache
- User Activity Logs
- Temporary Session Data

### **Azure Blob Storage** (Binary Files)
- Evidence files (PDFs, DOCs, Images)
- Template PDF files
- Generated reports
- Blob naming: `{containername}/{transferId}/{evidenceId}/{filename}`

---

## Azure SQL Database Schema

### **1. Users & Access Control**

#### `Users`
```sql
CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AzureADObjectId NVARCHAR(100) UNIQUE NOT NULL, -- Azure AD integration
    Email NVARCHAR(256) NOT NULL UNIQUE,
    FullName NVARCHAR(200) NOT NULL,
    Department NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER,
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedBy UNIQUEIDENTIFIER,
    
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_AzureADObjectId (AzureADObjectId)
);
```

#### `Roles`
```sql
CREATE TABLE Roles (
    RoleId INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50) NOT NULL UNIQUE, -- 'EndUser', 'Admin', 'Legal', 'Deputy-Legal', 'Business', 'DISO'
    Description NVARCHAR(500),
    Permissions NVARCHAR(MAX), -- JSON: ["submit_transfer", "review_evidence", "escalate"]
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX IX_Roles_RoleName (RoleName)
);
```

#### `UserRoles`
```sql
CREATE TABLE UserRoles (
    UserRoleId INT PRIMARY KEY IDENTITY(1,1),
    UserId UNIQUEIDENTIFIER NOT NULL,
    RoleId INT NOT NULL,
    AssignedAt DATETIME2 DEFAULT GETUTCDATE(),
    AssignedBy UNIQUEIDENTIFIER,
    ExpiresAt DATETIME2, -- Optional: role expiration
    
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
    UNIQUE (UserId, RoleId),
    INDEX IX_UserRoles_UserId (UserId)
);
```

---

### **2. Controls & Templates**

#### `Controls`
```sql
CREATE TABLE Controls (
    ControlId INT PRIMARY KEY IDENTITY(1,1),
    ControlCode NVARCHAR(50) NOT NULL UNIQUE, -- 'MER-13', 'MER-14', 'ROCC', 'EUC'
    ControlName NVARCHAR(200) NOT NULL,
    ControlType NVARCHAR(50) NOT NULL, -- 'MER', 'ROCC', 'EUC', 'Custom'
    Description NVARCHAR(MAX),
    ApplicationName NVARCHAR(200), -- If control is app-specific
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER,
    
    INDEX IX_Controls_ControlCode (ControlCode),
    INDEX IX_Controls_ControlType (ControlType)
);
```

#### `Templates`
```sql
CREATE TABLE Templates (
    TemplateId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ControlId INT NOT NULL,
    TemplateName NVARCHAR(200) NOT NULL,
    TemplateType NVARCHAR(50) NOT NULL, -- 'PDF_FORM', 'DYNAMIC_FORM'
    Version NVARCHAR(20) NOT NULL DEFAULT '1.0.0',
    Status NVARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'ARCHIVED'
    
    -- File metadata
    OriginalFileName NVARCHAR(255),
    FileSize BIGINT,
    DocumentType NVARCHAR(10), -- 'PDF', 'DOCX'
    BlobStorageUrl NVARCHAR(500), -- Azure Blob URL
    
    -- Template structure (JSON)
    Sections NVARCHAR(MAX), -- JSON: TemplateSection[]
    FieldMappings NVARCHAR(MAX), -- JSON: field ID -> app property mapping
    
    -- Tracking
    PreviousVersionId UNIQUEIDENTIFIER, -- Link to previous version
    UploadedBy UNIQUEIDENTIFIER NOT NULL,
    UploadedAt DATETIME2 DEFAULT GETUTCDATE(),
    LastUsedAt DATETIME2,
    UsageCount INT DEFAULT 0,
    
    FOREIGN KEY (ControlId) REFERENCES Controls(ControlId),
    FOREIGN KEY (PreviousVersionId) REFERENCES Templates(TemplateId),
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserId),
    
    INDEX IX_Templates_ControlId (ControlId),
    INDEX IX_Templates_Status (Status)
);
```

---

### **3. Transfers & Requirements**

> **Why `Requirements` table?**  
> A single Transfer can have multiple compliance requirements. For example:
> - Transfer to 3 jurisdictions (US, EU, UK) = 3 requirement rows
> - Each requirement can have separate evidence, status, and due dates
> - Allows granular tracking: "US requirement approved, EU under review, UK rejected"
> - In your current frontend: `transfer.requirements[]` array

#### `Transfers`
```sql
CREATE TABLE Transfers (
    TransferId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransferName NVARCHAR(300) NOT NULL,
    ControlId INT NOT NULL,
    TemplateId UNIQUEIDENTIFIER, -- NULL for non-MER transfers
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'COMPLETED', 'ESCALATED', 'REJECTED'
    
    -- Context
    Jurisdiction NVARCHAR(100),
    Entity NVARCHAR(200),
    SubjectType NVARCHAR(100),
    
    -- MER-specific (nullable for non-MER)
    MERType NVARCHAR(50), -- 'MER-13', 'MER-14'
    MERTemplateDataId UNIQUEIDENTIFIER, -- Reference to Cosmos DB document
    
    -- Escalation
    EscalatedTo NVARCHAR(50), -- 'Legal', 'Business'
    EscalatedBy UNIQUEIDENTIFIER,
    EscalatedAt DATETIME2,
    EscalationReason NVARCHAR(MAX),
    IsHighPriority BIT DEFAULT 0,
    
    -- Clarification
    ClarificationRequestedBy UNIQUEIDENTIFIER,
    ClarificationRequestedAt DATETIME2,
    ClarificationMessage NVARCHAR(MAX),
    ClarificationRespondedBy UNIQUEIDENTIFIER,
    ClarificationRespondedAt DATETIME2,
    ClarificationResponse NVARCHAR(MAX),
    
    -- Tracking
    CreatedBy UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2,
    
    FOREIGN KEY (ControlId) REFERENCES Controls(ControlId),
    FOREIGN KEY (TemplateId) REFERENCES Templates(TemplateId),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
    FOREIGN KEY (EscalatedBy) REFERENCES Users(UserId),
    
    INDEX IX_Transfers_Status (Status),
    INDEX IX_Transfers_CreatedBy (CreatedBy),
    INDEX IX_Transfers_CreatedAt (CreatedAt DESC),
    INDEX IX_Transfers_EscalatedTo (EscalatedTo)
);
```

#### `Requirements`
```sql
CREATE TABLE Requirements (
    RequirementId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransferId UNIQUEIDENTIFIER NOT NULL,
    RequirementName NVARCHAR(300) NOT NULL,
    Description NVARCHAR(MAX),
    
    Jurisdiction NVARCHAR(100),
    Entity NVARCHAR(200),
    SubjectType NVARCHAR(100),
    
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED'
    
    DueDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId) ON DELETE CASCADE,
    
    INDEX IX_Requirements_TransferId (TransferId),
    INDEX IX_Requirements_Status (Status),
    INDEX IX_Requirements_DueDate (DueDate)
);
```

---

### **4. Evidence Management**

#### `Evidence`
```sql
CREATE TABLE Evidence (
    EvidenceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RequirementId UNIQUEIDENTIFIER, -- NULL for MER virtual evidence
    TransferId UNIQUEIDENTIFIER NOT NULL, -- Direct link for MER submissions
    
    -- File metadata
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    FileType NVARCHAR(10) NOT NULL, -- 'PDF', 'DOC', 'DOCX', 'XLS', 'XLSX'
    BlobStorageUrl NVARCHAR(500) NOT NULL,
    BlobStorageContainer NVARCHAR(100),
    
    Description NVARCHAR(MAX),
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    
    -- Review
    ReviewerId UNIQUEIDENTIFIER,
    ReviewerNote NVARCHAR(MAX),
    ReviewedAt DATETIME2,
    
    -- Escalation
    EscalatedTo NVARCHAR(50),
    EscalatedBy UNIQUEIDENTIFIER,
    EscalatedAt DATETIME2,
    EscalationReason NVARCHAR(MAX),
    TaggedAuthorities NVARCHAR(MAX), -- JSON array: ['EDPB', 'ICO']
    
    -- Deputy Assignment
    AssignedDeputy UNIQUEIDENTIFIER,
    AssignedDeputyType NVARCHAR(50), -- 'Deputy-Legal', 'Deputy-Business'
    DeputyAssignedAt DATETIME2,
    DeputyAssignedBy UNIQUEIDENTIFIER,
    
    -- Tracking
    UploadedBy UNIQUEIDENTIFIER NOT NULL,
    UploadedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    -- Flags
    IsMERVirtualEvidence BIT DEFAULT 0, -- True for MER template submissions
    
    FOREIGN KEY (RequirementId) REFERENCES Requirements(RequirementId) ON DELETE SET NULL,
    FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES Users(UserId),
    FOREIGN KEY (ReviewerId) REFERENCES Users(UserId),
    
    INDEX IX_Evidence_TransferId (TransferId),
    INDEX IX_Evidence_RequirementId (RequirementId),
    INDEX IX_Evidence_Status (Status),
    INDEX IX_Evidence_ReviewerId (ReviewerId)
);
```

#### `EvidenceHistory`
```sql
CREATE TABLE EvidenceHistory (
    HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EvidenceId UNIQUEIDENTIFIER NOT NULL,
    Action NVARCHAR(50) NOT NULL, -- 'UPLOADED', 'REVIEWED', 'APPROVED', 'REJECTED', 'ESCALATED'
    PreviousStatus NVARCHAR(50),
    NewStatus NVARCHAR(50) NOT NULL,
    PerformedBy UNIQUEIDENTIFIER NOT NULL,
    PerformedAt DATETIME2 DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX),
    
    FOREIGN KEY (EvidenceId) REFERENCES Evidence(EvidenceId) ON DELETE CASCADE,
    FOREIGN KEY (PerformedBy) REFERENCES Users(UserId),
    
    INDEX IX_EvidenceHistory_EvidenceId (EvidenceId),
    INDEX IX_EvidenceHistory_PerformedAt (PerformedAt DESC)
);
```

---

### **5. Audit Trail**

#### `AuditTrail`
```sql
CREATE TABLE AuditTrail (
    AuditId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Entity tracking
    EntityType NVARCHAR(50) NOT NULL, -- 'Transfer', 'Requirement', 'Evidence', 'Template'
    EntityId UNIQUEIDENTIFIER NOT NULL,
    
    -- Action
    Action NVARCHAR(50) NOT NULL, -- 'CREATED', 'UPDATED', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED', 'ESCALATED'
    PreviousStatus NVARCHAR(50),
    NewStatus NVARCHAR(50),
    
    -- Details
    PerformedBy UNIQUEIDENTIFIER NOT NULL,
    PerformedAt DATETIME2 DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX),
    ChangeDetails NVARCHAR(MAX), -- JSON: detailed changes
    
    -- Context
    IPAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    
    FOREIGN KEY (PerformedBy) REFERENCES Users(UserId),
    
    INDEX IX_AuditTrail_EntityType_EntityId (EntityType, EntityId),
    INDEX IX_AuditTrail_PerformedBy (PerformedBy),
    INDEX IX_AuditTrail_PerformedAt (PerformedAt DESC)
);
```

---

### **6. SLA Management**

#### `SLAConfigurations`
```sql
CREATE TABLE SLAConfigurations (
    SLAConfigId INT PRIMARY KEY IDENTITY(1,1),
    ControlId INT NOT NULL,
    
    -- SLA Timing (in business days)
    TargetResponseDays INT NOT NULL, -- Days to respond
    WarningThresholdDays INT NOT NULL, -- When to show "approaching" warning
    
    -- Escalation
    AutoEscalateOnBreach BIT DEFAULT 0,
    EscalateToRole NVARCHAR(50), -- Role to escalate to on breach
    
    -- Notifications
    NotifyOnApproaching BIT DEFAULT 1,
    NotifyOnBreach BIT DEFAULT 1,
    
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (ControlId) REFERENCES Controls(ControlId),
    
    INDEX IX_SLAConfigurations_ControlId (ControlId)
);
```

#### `SLATracking`
```sql
CREATE TABLE SLATracking (
    SLATrackingId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TransferId UNIQUEIDENTIFIER NOT NULL,
    SLAConfigId INT NOT NULL,
    
    -- Dates
    StartDate DATETIME2 NOT NULL,
    TargetDate DATETIME2 NOT NULL,
    WarningDate DATETIME2 NOT NULL,
    CompletedDate DATETIME2,
    
    -- Status
    Status NVARCHAR(50) NOT NULL DEFAULT 'ON_TRACK', -- 'ON_TRACK', 'APPROACHING', 'BREACHED', 'COMPLETED'
    DaysRemaining INT,
    
    -- Tracking
    LastCheckedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId) ON DELETE CASCADE,
    FOREIGN KEY (SLAConfigId) REFERENCES SLAConfigurations(SLAConfigId),
    
    INDEX IX_SLATracking_TransferId (TransferId),
    INDEX IX_SLATracking_Status (Status),
    INDEX IX_SLATracking_TargetDate (TargetDate)
);
```

---

### **7. Notifications**

#### `Notifications`
```sql
CREATE TABLE Notifications (
    NotificationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    RecipientUserId UNIQUEIDENTIFIER NOT NULL,
    RecipientRole NVARCHAR(50), -- Optional: role-based notification
    
    Type NVARCHAR(50) NOT NULL, -- 'submit_request', 'approve', 'reject', 'escalate', 'sla_warning'
    Message NVARCHAR(MAX) NOT NULL,
    
    -- Links
    TransferId UNIQUEIDENTIFIER,
    EvidenceId UNIQUEIDENTIFIER,
    
    -- Status
    IsRead BIT DEFAULT 0,
    ReadAt DATETIME2,
    
    -- Channels
    SentToEmail BIT DEFAULT 0,
    SentToTeams BIT DEFAULT 0,
    
    -- Tracking
    SenderUserId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (RecipientUserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId) ON DELETE SET NULL,
    FOREIGN KEY (EvidenceId) REFERENCES Evidence(EvidenceId) ON DELETE SET NULL,
    
    INDEX IX_Notifications_RecipientUserId (RecipientUserId),
    INDEX IX_Notifications_IsRead (IsRead),
    INDEX IX_Notifications_CreatedAt (CreatedAt DESC)
);
```

---

### **8. Dynamic Data & Caching (Replaces NoSQL)**

> **Approach: Hybrid Relational + JSON**  
> Instead of Cosmos DB, we will use Azure SQL tables with `NVARCHAR(MAX)` columns to store strictly typed JSON data. Azure SQL supports querying JSON properties directly if needed.

#### `TransferMERData`
Stores the dynamic form data for MER transfers. Kept separate from `Transfers` table to keep the main table lightweight.

```sql
CREATE TABLE TransferMERData (
    TransferId UNIQUEIDENTIFIER PRIMARY KEY,
    
    -- Dynamic Form Data (JSON)
    -- Structure: { fieldValues: {...}, tableData: {...}, fileData: {...} }
    FormData NVARCHAR(MAX), 
    
    -- Metadata
    TemplateVersion NVARCHAR(20),
    LastSavedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId) ON DELETE CASCADE
);
```

#### `ApplicationMetadata`
Cache for external application data (SERA, iSAC).

```sql
CREATE TABLE ApplicationMetadata (
    SwcId NVARCHAR(50) PRIMARY KEY, -- e.g., "SWC-12345"
    AppName NVARCHAR(200) NOT NULL,
    Owner NVARCHAR(200),
    DataClassification NVARCHAR(50),
    HostingProvider NVARCHAR(100),
    
    -- Store complete raw response from source system
    RawData NVARCHAR(MAX), -- JSON
    
    SourceSystem NVARCHAR(50),
    LastSyncedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX IX_ApplicationMetadata_AppName (AppName)
);
```

#### `UserActivityLogs`
High-volume activity logging.

```sql
CREATE TABLE UserActivityLogs (
    LogId BIGINT PRIMARY KEY IDENTITY(1,1),
    UserId UNIQUEIDENTIFIER,
    Action NVARCHAR(50) NOT NULL,
    EntityType NVARCHAR(50),
    EntityId NVARCHAR(100),
    
    Details NVARCHAR(MAX), -- JSON: { ipAddress: "...", userAgent: "..." }
    
    Timestamp DATETIME2 DEFAULT GETUTCDATE(),
    
    INDEX IX_UserActivityLogs_UserId (UserId),
    INDEX IX_UserActivityLogs_Timestamp (Timestamp)
) 
-- Partitioning recommended by Month/Year for high volume
;
```

---

## Azure Blob Storage Structure

### Containers

```
evidence-files/
  ├── {transferId}/
  │     ├── {evidenceId}/
  │     │     ├── original_filename.pdf
  │     │     └── metadata.json
  
template-files/
  ├── {templateId}/
  │     ├── template.pdf
  │     └── metadata.json
  
reports/
  ├── compliance-reports/
  │     └── report-{date}.pdf
  
archived-data/
  ├── {year}/
        └── {month}/
              └── archived-transfers.json
```

### Blob Metadata Tags

```json
{
  "TransferId": "transfer-uuid",
  "EvidenceId": "evidence-uuid",
  "UploadedBy": "user-uuid",
  "FileType": "PDF",
  "Classification": "Confidential"
}
```

---

## Indexes & Performance

### SQL Database Indexes

1. **Covering Indexes** for dashboard queries
2. **Composite Indexes** for multi-column filters
3. **Included Columns** for SELECT optimization

### Cosmos DB Indexes

```json
{
  "indexingPolicy": {
    "automatic": true,
    "indexingMode": "consistent",
    "includedPaths": [
      { "path": "/transferId/*" },
      { "path": "/templateId/*" },
      { "path": "/metadata/createdAt/*" }
    ],
    "excludedPaths": [
      { "path": "/tableData/*" },
      { "path": "/fileData/*" }
    ]
  }
}
```

---

## Data Retention & Archival

### Retention Policies

| Data Type | Retention | Archive After | Delete After |
|-----------|-----------|---------------|--------------|
| Active Transfers | Indefinite | 2 years | - |
| Completed Transfers | 7 years | 2 years | 7 years |
| Evidence Files | 7 years | 2 years | 7 years |
| Audit Logs | 10 years | 3 years | 10 years |
| Notifications | 1 year | 6 months | 1 year |
| User Activity Logs | 2 years | 1 year | 2 years |

### Archive Strategy

- Use **Azure Blob Storage Archive Tier** for old evidence files
- Use **SQL Database Temporal Tables** for historical data
- Export to **Azure Data Lake** for long-term compliance storage
