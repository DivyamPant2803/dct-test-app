# Central Inventory - Master Context & Implementation Guide

> **Context for AI Agents**: This document contains the **Source of Truth** for the Central Inventory feature. When generating code or answering questions about this project, refer to the architectural decisions, schemas, and workflows defined below.

---

## 1. Project Overview
**Goal**: Build a backend system for "Central Inventory", a feature for tracking data transfer requests (MER and Non-MER).
**Constraint**: Must support high variety of templates (extensible) while maintaining strong relational integrity for workflows.
**Tech Stack**:
*   **Frontend**: React + TypeScript (Vite)
    *   **State Management**: React Context + Custom Hooks (`useEvidenceApi`)
    *   **Styling**: Valid CSS / Tailwind (if applicable)
    *   **Routing**: React Router (Role-based access)
*   **Backend**: .NET 8 Web API
*   **Database**: Azure SQL (Hybrid Approach: Relational + JSON)
*   **Storage**: Azure Blob Storage

---

## 2. Where to Find Details (Deep Dives)
> **Agent Note**: If the user asks for specific schema columns, full API payloads, or complex edge cases, refer to these detailed artifacts:

| Topic | File | Purpose |
| :--- | :--- | :--- |
| **Database Design** | `database_schema.md` | Full SQL `CREATE` scripts & JSON structures. |
| **API Endpoints** | `api_specifications.md` | Request/Response schemas for all 60+ endpoints. |
| **Workflows** | `sequence_diagrams.md` | Mermaid diagrams for User, Admin, Legal flows. |
| **Implementation** | `refined_work_items.md` | Prioritized checklist of 38 dev tasks. |
| **Service Roles** | `service_usage_guide.md` | Responsibilities of backend services. |
| **UI/UX Spec** | `frontend_implementation_guide.md` | React Components, Routes, and Styles. |

---

## 3. Core Architecture Decisions

### **2.1 Database Strategy: SQL Hybrid**
**Decision**: Use **Single SQL Database** instead of SQL + NoSQL.
*   **Why**: We need transactions (ACID) when saving Transfers, but flexibility for the form data.
*   **Pattern**:
    *   **Relational Columns**: For fixed logic (`Status`, `CreatedBy`, `EscalatedTo`, `SLA`).
    *   **JSON Columns (`NVARCHAR(MAX)`)**: For dynamic form answers (`FormData`).
    *   **Benefits**: Transaction safety, easy reporting (via SQL Views), infrastructure simplicity.

### **2.2 Service Boundaries**
| Service | Responsibility |
| :--- | :--- |
| **Transfer Service** | Core CRUD, Transaction management, MER Data storage. |
| **Evidence Service** | File uploads (Blob), SAS tokens, Metadata (SQL). |
| **Workflow Service** | Review actions (Approve/Reject), Escalations, State transitions. |
| **Template Service** | Serving JSON schemas for different control types (MER-13, ROCC). |
| **Notification Service** | In-app alerts, Email/Teams via Azure Service Bus. |

---

## 3. Data Model (SQL Schema)

### **3.1 Transfers Table (Core Entity)**
```sql
CREATE TABLE Transfers (
    TransferId UNIQUEIDENTIFIER PRIMARY KEY,
    Status NVARCHAR(20) NOT NULL, -- 'PENDING', 'ACTIVE', 'ESCALATED'
    CreatedBy NVARCHAR(100) NOT NULL,
    EscalatedTo NVARCHAR(50),     -- 'Legal', 'Business', NULL
    EscalatedAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

### **3.2 TransferMERData (The Dynamic Part)**
Stores the variable answers from the UI.
```sql
CREATE TABLE TransferMERData (
    TransferId UNIQUEIDENTIFIER PRIMARY KEY,
    TemplateVersion NVARCHAR(50), -- e.g., 'MER-13'
    FormData NVARCHAR(MAX),       -- JSON: { "q1": "Answer", "table": [...] }
    CONSTRAINT FK_Transfer FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId)
);
```

### **3.3 Requirements Table**
Granular tracking of specific compliance items within a transfer.
```sql
CREATE TABLE Requirements (
    ReqId UNIQUEIDENTIFIER PRIMARY KEY,
    TransferId UNIQUEIDENTIFIER, 
    Jurisdiction NVARCHAR(50),    -- 'US', 'EU'
    Status NVARCHAR(20),          -- 'APPROVED', 'REJECTED'
    CONSTRAINT FK_TransferReq FOREIGN KEY (TransferId) REFERENCES Transfers(TransferId)
);
```

### **3.4 Evidence Table**
```sql
CREATE TABLE Evidence (
    EvidenceId UNIQUEIDENTIFIER PRIMARY KEY,
    TransferId UNIQUEIDENTIFIER,
    BlobUrl NVARCHAR(500),
    UploadedBy NVARCHAR(100),
    Status NVARCHAR(20) -- 'PENDING', 'APPROVED', 'ESCALATED'
);
```

---

## 4. API & Implementation Pattern

### **4.1 Saving Dynamic Data (.NET)**
**Pattern**: Accept `object` in DTO, Serialize to `string` in Controller.

```csharp
// DTO
public class CreateTransferRequest {
    public string Name { get; set; }
    public object FormData { get; set; } // Any JSON structure
}

// Controller
string jsonString = JsonSerializer.Serialize(request.FormData);
var entity = new TransferMERData { FormData = jsonString };
_db.Add(entity);
```

### **4.2 Reporting Strategy**
**Pattern**: Use SQL Views to flatten JSON for reporting tools.
```sql
CREATE VIEW vw_Report_MER13 AS
SELECT 
    T.TransferId, 
    T.Status,
    JSON_VALUE(D.FormData, '$.RiskLevel') as Risk
FROM Transfers T
JOIN TransferMERData D ON T.TransferId = D.TransferId;
```

---

## 5. Workflows Logic

### **5.1 End User Submission**
1.  Frontend validates form.
2.  POST `/api/v1/transfers` with body `{ name: "...", formData: {...} }`.
3.  Backend starts Transaction:
    *   Insert `Transfers`.
    *   Insert `TransferMERData`.
    *   Insert `Requirements` (based on Logic).
    *   Commit.

### **5.2 Admin Review**
1.  Admin fetches Queue: `SELECT * FROM Evidence WHERE Status='PENDING'`.
2.  Admin Approves: Updates `Evidence.Status = 'APPROVED'`.
3.  System Check: If **All** Evidence for a Transfer is Approved → Update `Transfers.Status = 'COMPLETED'`.

### **5.3 Escalation**
1.  Admin Escales: POST `/api/v1/transfers/{id}/escalate`.
2.  Backend:
    *   Update `Transfers.Status = 'ESCALATED'`.
    *   Update `Transfers.EscalatedTo = 'Legal'`.
    *   Notify Legal Team (Service Bus).

---

### **6. Frontend Implementation Strategy**

#### **6.1 Component Architecture**
*   **Smart Containers**: `CentralInventoryPage`, `AdminDashboard`, `LegalDashboard`. Handle API calls and state.
*   **Dumb Components**: `DynamicTemplateForm`, `EvidenceUpload`, `ReviewPanel`. Pure UI, receive props.

#### **6.2 Data Handling**
*   **Fetching**: Use custom hooks (`useTransfer`, `useEvidenceQueue`) to wrap Axios calls.
*   **Form State**: Treat dynamic form data as specific `Record<string, any>` objects. Do not try to strictly type the form fields on the client side (let the schema drive it).

#### **6.3 Authentication**
*   Use `PersonaRouter` to protect routes.
*   Attach Bearer tokens (MSAL/Azure AD) to every Axios request via an interceptor.

---

## 7. Work Items (Implementation Checklist)

### **Phase 1: MVP (Critical Priorities)**
*   [ ] **A1-A3**: Setup .NET 8, Azure SQL, and Auth (Azure AD).
*   [ ] **B1-B2**: Implement SQL Schema (Transfers, MERData, Evidence).
*   [ ] **E1**: Create `POST /transfers` API (The Hybrid JSON Save).
*   [ ] **F1**: Create `POST /evidence` API (Blob Storage integration).
*   [ ] **N1-N2**: Build Frontend Wizard & "My Transfers" Dashboard.
*   [ ] **G3**: Implement Escalation Logic (Status updates + Notifications).

### **Phase 2: Production**
*   [ ] **J1-J2**: SLA Tracking Background Job.
*   [ ] **K1**: Integration with External Systems (SERA/iSAC) via cached SQL tables.

---

> **Note to AI Agent**: When asked to implement a feature, always verify if it touches the **Dynamic Data Layer** (needs JSON serialization) or the **Core Logic Layer** (standard SQL columns). Use the Hybrid pattern defined above.
