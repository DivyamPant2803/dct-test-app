# Central Inventory Backend - Changes Summary

## Updates Based on Your Feedback

### **Items Removed (Not Required for MVP)**

#### ❌ **AI/ML Service** (Future - Phase 3)
- AI field suggestions
- Risk scoring
- Document analysis
- Review assistance

#### ❌ **File Processing Service** (Future - Phase 3)
- PDF parsing with OCR
- Template auto-generation from PDFs
- Document Intelligence integration

#### ❌ **Reporting Service** (Future - Phase 3)
- Advanced compliance reports
- PDF/Excel exports
- Built-in analytics (using basic dashboard analytics from Aggregation Service instead)

#### ❌ **Bulk Operations**
- Bulk approve/reject removed from API specs

#### ❌ **Clarification Request Workflow**
- Removed as separate work item (can be added later if needed)

#### 🔄 **Replaced Cosmos DB with SQL Tables** (User Request)
- Removed Cosmos DB NoSQL database
- Used SQL Tables with JSON columns (`NVARCHAR(MAX)`) for:
  - `TransferMERData` (Dynamic form data)
  - `ApplicationMetadata` (Cached external data)
  - `UserActivityLogs` (High volume logs)
- Simplified architecture stack (Pure SQL + Blob Storage)

---

## Updated Architecture Components

### **Core Services (MVP - Required)**
```
Main .NET API
├── Notification Service ✅
├── Aggregation Service ✅
├── MER Template Engine ✅
├── SLA Monitor ✅
├── Workflow Service ✅
├── Evidence Service ✅
├── 🆕 Audit Service
├── 🆕 Template Management Service
└── 🆕 User Management Service
```

### **Core Infrastructure (MVP - Required)**
```
├── Azure SQL DB ✅
├── Azure Blob Storage ✅
├── Azure Cache for Redis ✅
├── Azure Cognitive Search ✅
├── Application Insights ✅
├── 🆕 Azure Service Bus (async workflows)
├── 🆕 Azure Key Vault (secrets)
└── 🆕 Azure Monitor (alerts)
```

---

## Updated Effort & Timeline

### **Before vs After**

| Metric | Original | Updated |
|--------|----------|---------|
| Total Work Items | 45 | 38 |
| Total Days | 116 | 97 |
| Backend Dev Time | 3 months | 2.5 months |
| Frontend Dev Time | 1.5 months | 1.5 months |

### **Implementation Phases**

#### **Phase 1: MVP (P0)** - 8 weeks
- Core infrastructure setup
- Database schemas (SQL, Cosmos, Blob)
- User management & authentication
- Transfer submission workflow
- Evidence upload/review
- SLA tracking
- Email notifications
- All 5 dashboards (End User, Admin, Legal, Business, DISO)

#### **Phase 2: Production Ready (P1)** - 4 weeks
- Deputy assignments
- MS Teams integration
- Dashboard analytics
- Monitoring & alerting
- Background jobs (sync, SLA monitoring)

#### **Phase 3: Future Enhancements (P2)** - 2 weeks
- Compliance reporting exports
- Advanced analytics
- Additional integrations

---

## Key Database Tables (MVP)

### **Users & Access**
- `Users` - User profiles (Azure AD sync)
- `Roles` - EndUser, Admin, Legal, Deputy-Legal, Business, DISO
- `UserRoles` - User-to-role assignments

### **Controls & Templates**
- `Controls` - MER-13, MER-14, ROCC, EUC
- `Templates` - Uploaded templates (PDF or dynamic forms)

### **Workflow**
- `Transfers` - Main request entity
- `Requirements` - Sub-items within a transfer (explained below ⬇️)
- `Evidence` - Uploaded files + metadata
- `EvidenceHistory` - Full audit trail

### **SLA & Notifications**
- `SLAConfigurations` - Configurable SLA rules per control
- `SLATracking` - Real-time SLA status per transfer
- `Notifications` - In-app, email, Teams notifications

### **Audit**
- `AuditTrail` - Comprehensive audit log for all entities

---

## Requirements Table Explained

### **Why do we need a separate `Requirements` table?**

**Scenario:**
```
Transfer: "Data Transfer - App X"
├── Requirement 1: US jurisdiction (Status: APPROVED)
├── Requirement 2: EU jurisdiction (Status: UNDER_REVIEW)
└── Requirement 3: UK jurisdiction (Status: REJECTED)
```

**Benefits:**
1. **Granular Tracking**: Each jurisdiction has its own status, evidence, and due date
2. **Flexible Evidence**: User can upload different evidence for each requirement
3. **Partial Approval**: US approved while EU is still under review
4. **SLA Tracking**: Different SLA per jurisdiction
5. **Frontend Mapping**: Directly maps to your current `transfer.requirements[]` array

**Example in Frontend:**
```typescript
const transfer = {
  id: "transfer-123",
  name: "Data Transfer - App X",
  requirements: [
    { id: "req-1", jurisdiction: "US", status: "APPROVED" },
    { id: "req-2", jurisdiction: "EU", status: "UNDER_REVIEW" },
    { id: "req-3", jurisdiction: "UK", status: "REJECTED" }
  ]
}
```

---

## API Endpoints Summary

### **Total Endpoints: 60+**

| Category | Endpoints | Examples |
|----------|-----------|----------|
| Users | 3 | GET /users/me, POST /users/{id}/roles |
| Controls | 2 | GET /controls, POST /controls |
| Templates | 4 | GET /templates, POST /templates, PUT /templates/{id} |
| Transfers | 5 | POST /transfers, GET /transfers, PUT /transfers/{id} |
| Evidence | 5 | POST /evidence, GET /evidence/queue, GET /evidence/{id}/download |
| Workflow | 6 | POST /evidence/{id}/review, POST /transfers/{id}/escalate |
| SLA | 3 | GET /sla/configurations, GET /sla/breaches |
| Notifications | 3 | GET /notifications, PUT /notifications/{id}/read |
| Audit | 2 | GET /transfers/{id}/audit-trail, GET /evidence/{id}/audit-trail |
| External | 3 | GET /external/applications, POST /external/sync |
| Analytics | 2 | GET /analytics/dashboard, GET /analytics/compliance-report |

---

## Next Steps

### **Immediate Actions**
1. ✅ Review updated documents
2. ⬜ Prioritize P0 work items for sprint planning
3. ⬜ Set up Azure infrastructure (Bicep/ARM templates)
4. ⬜ Initialize .NET 8 backend project
5. ⬜ Create database migration scripts

### **Technical Decisions Needed**
1. **Azure SQL tier**: Basic vs Standard vs Premium?
2. **Cosmos DB RU allocation**: 400 RU/s to start?
3. **Environment strategy**: Dev, Staging, Prod?
4. **CI/CD tool**: Azure DevOps or GitHub Actions?
5. **Monitoring budget**: Application Insights retention period?

### **Team Allocation**
```
Backend Team (2 devs):
├── Dev 1: User management, Auth, Controls, Templates
└── Dev 2: Transfers, Evidence, Workflow, SLA

Frontend Team (2 devs):
├── Dev 1: Central Inventory, End User Dashboard, Admin Dashboard
└── Dev 2: Legal Dashboard, Business Dashboard, Common components

DevOps (1 engineer):
└── Infrastructure, CI/CD, Monitoring, Security

QA (1 engineer):
└── Test automation, Manual testing (concurrent with dev)
```

---

## Files Updated

1. **backend_architecture_review.md**
   - Removed AI, file processing, reporting from critical gaps
   - Moved to "Future Enhancements" section

2. **database_schema.md**
   - Added clear explanation for Requirements table
   - No schema changes

3. **api_specifications.md**
   - Removed bulk operations APIs
   - Removed AI integration endpoints
   - No other changes

4. **refined_work_items.md**
   - Removed 7 work items (AI, template auto-gen, bulk ops, clarification)
   - Updated total: 38 items, 97 days
   - Updated team estimates: 2.5 months backend

---

## Questions?

Let me know if you need:
- Azure cost estimation
- Detailed sprint breakdown
- Infrastructure templates (Bicep)
- API implementation examples
- Database migration scripts
- CI/CD pipeline setup
