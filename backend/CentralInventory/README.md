# Central Inventory Backend - .NET 8 Web API

Complete boilerplate code for the Central Inventory backend system using .NET 8, implementing a **Hybrid Data Strategy** (relational + JSON) for flexible data transfer management.

## 🏗️ Architecture

**Modular Monolith** with **Clean Architecture** principles:

- **Core Layer** - Domain entities, interfaces, DTOs, enums
- **Infrastructure Layer** - EF Core, services, Azure integrations
- **API Layer** - Controllers, middleware, configuration

## 🚀 Technology Stack

| Component | Technology |
|-----------|-----------|
| Framework | .NET 8.0 |
| Language | C# 12 |
| Database | Azure SQL Database |
| ORM | Entity Framework Core 8 (Code-First) |
| Storage | Azure Blob Storage |
| Authentication | Azure AD (Microsoft.Identity.Web) |
| JSON | System.Text.Json |
| API Docs | Swagger/OpenAPI (Swashbuckle) |

## 📁 Project Structure

```
CentralInventory/
├── src/
│   ├── CentralInventory.Core/              # Domain Layer
│   │   ├── Entities/                       # 9 entities
│   │   ├── Enums/                          # 5 enums
│   │   ├── DTOs/                           # Request/Response DTOs
│   │   └── Interfaces/                     # 6 service interfaces
│   │
│   ├── CentralInventory.Infrastructure/    # Infrastructure Layer
│   │   ├── Data/
│   │   │   └── ApplicationDbContext.cs     # EF Core DbContext
│   │   └── Services/                       # 5 service implementations
│   │
│   └── CentralInventory.API/               # API Layer
│       ├── Controllers/                    # 2 controllers (Transfers, Evidence)
│       ├── Program.cs                      # DI & middleware setup
│       └── appsettings.json
```

## 🔑 Key Features Implemented

### 1. Hybrid Data Strategy ⭐

**Problem**: Need to store dynamic MER template data (variable schemas) while maintaining relational integrity.

**Solution**: Store workflow data (status, dates, owners) in relational columns, but form data as JSON in `NVARCHAR(MAX)`.

```csharp
// DTO accepts generic object
public class CreateTransferRequest {
    public object? MerTemplateData { get; set; }
}

// Service serializes to JSON string
string jsonString = JsonSerializer.Serialize(request.MerTemplateData);
var merData = new TransferMERData { FormData = jsonString };
```

### 2. Atomic Transactions

Transfer creation uses EF Core transactions to ensure atomicity:

```csharp
using var transaction = await _context.Database.BeginTransactionAsync();
// 1. Create Transfer
// 2. Create TransferMERData (JSON)
// 3. Log Audit
// 4. Send Notification
await transaction.CommitAsync();
```

### 3. Azure Blob Storage Integration

Evidence files uploaded to Azure Blob Storage with SAS token generation:

```csharp
// Upload
await _blobStorageService.UploadFileAsync(containerName, blobName, stream, contentType);

// Generate temporary download URL
var sasUrl = await _blobStorageService.GenerateSasUrlAsync(containerName, blobName, TimeSpan.FromHours(1));
```

### 4. Comprehensive Audit Trail

Every state change logged to `AuditTrail` table with full context:

```csharp
await _auditService.LogAuditAsync(
    entityType: "Transfer",
    entityId: transferId,
    action: "CREATED",
    previousStatus: null,
    newStatus: "PENDING",
    performedBy: userId);
```

## 🗄️ Database Schema

### Core Entities

1. **Transfer** - Root aggregate for data transfers
2. **TransferMERData** - Dynamic JSON form data (one-to-one with Transfer)
3. **Requirement** - Granular compliance requirements
4. **Evidence** - File metadata with Blob Storage URLs
5. **EvidenceHistory** - State change tracking
6. **AuditTrail** - Comprehensive audit logging
7. **User** - Azure AD integrated users
8. **Role** - Roles with JSON permissions
9. **UserRole** - Many-to-many junction

### Fluent API Highlights

```csharp
// TransferMERData: JSON column configuration
entity.Property(e => e.FormData)
    .IsRequired()
    .HasColumnType("NVARCHAR(MAX)");

// One-to-one relationship
entity.HasOne(e => e.Transfer)
    .WithOne(t => t.TransferMERData)
    .HasForeignKey<TransferMERData>(e => e.TransferId)
    .OnDelete(DeleteBehavior.Cascade);
```

## 🔌 API Endpoints

### Transfers

```http
POST   /api/v1/transfers              # Create transfer with MER data
GET    /api/v1/transfers              # List transfers (paginated)
GET    /api/v1/transfers/{id}         # Get transfer details
```

### Evidence

```http
POST   /api/v1/evidence               # Upload evidence (multipart/form-data)
GET    /api/v1/evidence/{id}          # Get evidence details
GET    /api/v1/evidence/transfer/{id} # Get all evidence for transfer
GET    /api/v1/evidence/queue         # Admin queue (role-based)
GET    /api/v1/evidence/{id}/download # Generate SAS URL
```

## 🛠️ Setup Instructions

### Prerequisites

- .NET 8 SDK
- SQL Server (LocalDB for development)
- Azure Storage Emulator (Azurite) or Azure Storage Account

### 1. Clone and Restore

```bash
cd backend/CentralInventory
dotnet restore
```

### 2. Update Configuration

Edit `src/CentralInventory.API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CentralInventoryDB;Trusted_Connection=True;",
    "BlobStorage": "UseDevelopmentStorage=true"
  }
}
```

### 3. Create Database

```bash
cd src/CentralInventory.API
dotnet ef migrations add InitialCreate --project ../CentralInventory.Infrastructure
dotnet ef database update
```

### 4. Run Application

```bash
dotnet run --project src/CentralInventory.API
```

Navigate to `https://localhost:5001` (Swagger UI at root).

## 📝 Usage Examples

### Create Transfer with MER Data

```http
POST /api/v1/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "transferName": "Data Transfer - App X",
  "controlId": 1,
  "templateId": "uuid",
  "jurisdiction": "US",
  "merType": "MER-13",
  "merTemplateData": {
    "fieldValues": {
      "question1": "Answer to question 1",
      "riskLevel": "High"
    },
    "tableData": [
      { "col1": "value1", "col2": "value2" }
    ]
  }
}
```

### Upload Evidence

```http
POST /api/v1/evidence
Authorization: Bearer {token}
Content-Type: multipart/form-data

transferId: {guid}
requirementId: {guid}
description: "Architecture diagram"
file: {binary}
```

## 🔐 Authentication

Uses **Azure AD** with JWT Bearer tokens. Configure in `appsettings.json`:

```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "{your-tenant-id}",
    "ClientId": "{your-client-id}"
  }
}
```

Controllers extract user ID from claims:

```csharp
var userIdClaim = User.FindFirst("sub") ?? User.FindFirst("oid");
```

## 📊 Service Architecture

```
┌─────────────────────────────────────────┐
│         Controllers (API Layer)         │
├─────────────────────────────────────────┤
│  TransfersController | EvidenceController│
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         Services (Business Logic)       │
├─────────────────────────────────────────┤
│ TransferService  │ EvidenceService      │
│ AuditService     │ NotificationService  │
│ BlobStorageService                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Infrastructure (Data Access)         │
├─────────────────────────────────────────┤
│ ApplicationDbContext (EF Core)          │
│ Azure Blob Storage Client               │
└─────────────────────────────────────────┘
```

## 🎯 Critical Implementation Patterns

### 1. JSON Serialization Pattern

```csharp
// Accept object in DTO
public object? MerTemplateData { get; set; }

// Serialize in service
string jsonString = JsonSerializer.Serialize(request.MerTemplateData);

// Store as string in entity
public string FormData { get; set; }
```

### 2. File Upload Pattern

```csharp
// Controller accepts IFormFile
[FromForm] UploadEvidenceRequest request

// Service streams to Blob Storage
using (var stream = file.OpenReadStream())
{
    await _blobStorageService.UploadFileAsync(...);
}
```

### 3. Audit Trail Pattern

```csharp
// Every state change logged
await _auditService.LogAuditAsync(
    entityType: "Transfer",
    entityId: id,
    action: "STATUS_UPDATED",
    previousStatus: "PENDING",
    newStatus: "ACTIVE",
    performedBy: userId);
```

## 🚧 TODO / Next Steps

- [ ] Implement `WorkflowService` (Approve/Reject/Escalate logic)
- [ ] Add `TemplateService` for template management
- [ ] Implement SLA tracking background job
- [ ] Add Azure Service Bus for async notifications
- [ ] Implement health check endpoints
- [ ] Add Application Insights telemetry
- [ ] Create integration tests
- [ ] Add data seeding for development

## 📚 References

- [Database Schema](../../../central_inventory_docs/database_schema.md)
- [API Specifications](../../../central_inventory_docs/api_specifications.md)
- [Backend Architecture Review](../../../central_inventory_docs/backend_architecture_review.md)

## 📄 License

Internal use only.
