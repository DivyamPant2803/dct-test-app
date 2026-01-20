# Central Inventory Backend - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Prerequisites

Ensure you have installed:
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb) (comes with Visual Studio)
- [Azurite](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) (Azure Storage Emulator)

### Step 2: Start Azurite (Blob Storage Emulator)

```bash
# Install Azurite globally
npm install -g azurite

# Start Azurite
azurite --silent --location ./azurite --debug ./azurite/debug.log
```

### Step 3: Create Database

```bash
# Navigate to API project
cd backend/CentralInventory/src/CentralInventory.API

# Add initial migration
dotnet ef migrations add InitialCreate --project ../CentralInventory.Infrastructure --startup-project .

# Create database
dotnet ef database update
```

### Step 4: Run the API

```bash
# From the API project directory
dotnet run

# Or use watch mode for development
dotnet watch run
```

The API will start at:
- **HTTPS**: `https://localhost:5001`
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `https://localhost:5001` (root)

### Step 5: Test the API

Open Swagger UI at `https://localhost:5001` and test the endpoints.

## 🧪 Testing with Sample Data

### Create a Transfer (POST /api/v1/transfers)

```json
{
  "transferName": "Test Data Transfer",
  "controlId": 1,
  "jurisdiction": "US",
  "entity": "Test Entity",
  "subjectType": "Client",
  "merType": "MER-13",
  "merTemplateData": {
    "fieldValues": {
      "riskLevel": "High",
      "dataClassification": "Confidential"
    },
    "tableData": [
      {
        "jurisdiction": "US",
        "dataType": "PII",
        "volume": "1000 records"
      }
    ]
  }
}
```

**Note**: For development, authentication is disabled by default. In production, you'll need Azure AD tokens.

## 🔧 Development Configuration

### appsettings.Development.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=CentralInventoryDB;Trusted_Connection=True;",
    "BlobStorage": "UseDevelopmentStorage=true"
  }
}
```

## 📊 Database Seeding (Optional)

Create a seed script to populate initial data:

```bash
# Create a new migration for seed data
dotnet ef migrations add SeedInitialData --project ../CentralInventory.Infrastructure
```

Add seed data in `ApplicationDbContext.OnModelCreating`:

```csharp
// Seed Roles
modelBuilder.Entity<Role>().HasData(
    new Role { RoleId = 1, RoleName = "EndUser", Description = "End user role" },
    new Role { RoleId = 2, RoleName = "Admin", Description = "Admin role" },
    new Role { RoleId = 3, RoleName = "Legal", Description = "Legal team role" }
);
```

## 🐛 Troubleshooting

### Issue: Database connection failed

**Solution**: Ensure SQL Server LocalDB is running:

```bash
sqllocaldb start mssqllocaldb
sqllocaldb info mssqllocaldb
```

### Issue: Blob Storage connection failed

**Solution**: Ensure Azurite is running:

```bash
azurite --silent --location ./azurite
```

### Issue: Migration failed

**Solution**: Delete the database and recreate:

```bash
dotnet ef database drop --force
dotnet ef database update
```

## 📝 Next Steps

1. **Implement WorkflowService** - Add approve/reject/escalate logic
2. **Add Authentication** - Configure Azure AD for production
3. **Create Integration Tests** - Test end-to-end workflows
4. **Deploy to Azure** - Use Azure App Service + Azure SQL

## 🔗 Useful Commands

```bash
# Build solution
dotnet build

# Run tests
dotnet test

# Create new migration
dotnet ef migrations add <MigrationName> --project ../CentralInventory.Infrastructure

# Update database
dotnet ef database update

# Rollback migration
dotnet ef database update <PreviousMigrationName>

# Generate SQL script
dotnet ef migrations script --output migration.sql
```

## 📚 Additional Resources

- [EF Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [Azure Blob Storage SDK](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-dotnet)
- [Microsoft.Identity.Web](https://learn.microsoft.com/en-us/azure/active-directory/develop/microsoft-identity-web)
