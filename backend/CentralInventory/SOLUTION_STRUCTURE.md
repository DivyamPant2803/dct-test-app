# Central Inventory Backend - Solution Structure

```
CentralInventory/
├── src/
│   ├── CentralInventory.Core/              # Domain Layer
│   │   ├── Entities/
│   │   │   ├── Transfer.cs
│   │   │   ├── TransferMERData.cs
│   │   │   ├── Requirement.cs
│   │   │   ├── Evidence.cs
│   │   │   ├── EvidenceHistory.cs
│   │   │   ├── AuditTrail.cs
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   ├── UserRole.cs
│   │   │   ├── Control.cs
│   │   │   ├── Template.cs
│   │   │   ├── SLAConfiguration.cs
│   │   │   ├── SLATracking.cs
│   │   │   ├── Notification.cs
│   │   │   └── ApplicationMetadata.cs
│   │   ├── Enums/
│   │   │   ├── TransferStatus.cs
│   │   │   ├── EvidenceStatus.cs
│   │   │   ├── RequirementStatus.cs
│   │   │   ├── EscalationType.cs
│   │   │   └── SLAStatus.cs
│   │   ├── DTOs/
│   │   │   ├── Requests/
│   │   │   │   ├── CreateTransferRequest.cs
│   │   │   │   ├── UpdateTransferRequest.cs
│   │   │   │   ├── UploadEvidenceRequest.cs
│   │   │   │   ├── ReviewEvidenceRequest.cs
│   │   │   │   └── EscalateTransferRequest.cs
│   │   │   └── Responses/
│   │   │       ├── TransferResponse.cs
│   │   │       ├── EvidenceResponse.cs
│   │   │       ├── RequirementResponse.cs
│   │   │       └── PaginatedResponse.cs
│   │   └── Interfaces/
│   │       ├── ITransferService.cs
│   │       ├── IEvidenceService.cs
│   │       ├── IWorkflowService.cs
│   │       ├── INotificationService.cs
│   │       ├── IAuditService.cs
│   │       └── IBlobStorageService.cs
│   │
│   ├── CentralInventory.Infrastructure/     # Infrastructure Layer
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── TransferConfiguration.cs
│   │   │   │   ├── EvidenceConfiguration.cs
│   │   │   │   ├── RequirementConfiguration.cs
│   │   │   │   └── AuditTrailConfiguration.cs
│   │   │   └── Migrations/
│   │   ├── Services/
│   │   │   ├── TransferService.cs
│   │   │   ├── EvidenceService.cs
│   │   │   ├── WorkflowService.cs
│   │   │   ├── NotificationService.cs
│   │   │   ├── AuditService.cs
│   │   │   └── BlobStorageService.cs
│   │   └── Extensions/
│   │       └── ServiceCollectionExtensions.cs
│   │
│   └── CentralInventory.API/                # API Layer
│       ├── Controllers/
│       │   ├── TransfersController.cs
│       │   ├── EvidenceController.cs
│       │   ├── RequirementsController.cs
│       │   ├── WorkflowController.cs
│       │   ├── NotificationsController.cs
│       │   └── AuditController.cs
│       ├── Middleware/
│       │   ├── ExceptionHandlingMiddleware.cs
│       │   └── AuditLoggingMiddleware.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── appsettings.Development.json
│
└── tests/
    ├── CentralInventory.UnitTests/
    └── CentralInventory.IntegrationTests/
```

## Technology Stack

- **.NET 8.0** - Latest LTS version
- **C# 12** - Latest language features
- **Entity Framework Core 8** - Code-First approach
- **Azure.Storage.Blobs** - Blob storage client
- **System.Text.Json** - JSON serialization
- **Microsoft.Identity.Web** - Azure AD authentication
- **Swashbuckle.AspNetCore** - OpenAPI/Swagger documentation

## Key Design Patterns

1. **Clean Architecture** - Separation of concerns
2. **Repository Pattern** - Data access abstraction (via EF Core DbContext)
3. **Dependency Injection** - Built-in .NET DI container
4. **CQRS-lite** - Separate read/write operations where beneficial
5. **Unit of Work** - Transaction management via DbContext
