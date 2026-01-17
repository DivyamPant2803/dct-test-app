# Central Inventory - Refined Work Items

## Work Items Organization

**Priority Tiers:**
- **P0 (Critical)**: Must-have for MVP
- **P1 (High)**: Required for production launch
- **P2 (Medium)**: Important but can be staged
- **P3 (Low)**: Nice-to-have enhancements

---

## Original Work Items Analysis

### ✅ Well-Scoped Items (Keep As-Is)
- #1-6: Dashboard UIs (Frontend)
- #13: External system integration APIs
- #17-18: Application lookup APIs
- #20-21: MER template data APIs
- #22: Evidence fetching API
- #23-24: Review workflow APIs
- #25-26: Notification APIs

### ⚠️ Items Needing Refinement
- #7: Backend boilerplate → Too vague, needs breakdown
- #8: MS Teams/Outlook integration → Needs Azure services specification
- #9: Evidence storage → Missing file processing pipeline
- #10-11: User/Evidence tables → Missing related schemas
- #12: SLA API → Missing SLA configuration management
- #14: Configure roles → Clarify Azure AD vs custom RBAC
- #15-16: Control tables → Missing template lifecycle
- #19: Prefill template → Missing AI integration

---

## Refined Work Items by Component

### **A. Infrastructure & Foundation (P0)**

#### A1. Azure Infrastructure Setup
**Priority:** P0  
**Effort:** 3 days  
**Description:**
- Provision Azure resources using Bicep/ARM templates
- Azure SQL Database (with geo-replication)
- Azure Blob Storage (with lifecycle policies)
- Azure Cache for Redis
- Azure Service Bus
- Azure Key Vault
- Azure Application Insights

**Deliverables:**
- Infrastructure as Code (IaC) templates
- Resource naming conventions
- Environment configs (dev, staging, prod)

---

#### A2. Backend Boilerplate & Project Structure
**Priority:** P0  
**Effort:** 2 days  
**Original:** #7  
**Description:**
- Initialize .NET 8 Web API project
- Setup dependency injection
- Configure logging (Application Insights)
- Setup Entity Framework Core
- Blob Storage SDK integration

**Project Structure:**
```
CentralInventory.API/
├── Controllers/
├── Services/
│   ├── UserManagement/
│   ├── TemplateManagement/
│   ├── TransferWorkflow/
│   ├── Evidence/
│   ├── SLA/
│   ├── Notification/
│   ├── Audit/
│   └── External/
├── Data/
│   ├── SqlContext.cs
│   └── Repositories/
├── Models/
└── Middleware/
```

---

#### A3. Authentication & Authorization
**Priority:** P0  
**Effort:** 2 days  
**Original:** #14 (partial)  
**Description:**
- Azure AD B2C integration
- OAuth 2.0 + JWT validation
- RBAC middleware
- Permission-based authorization
- Role seeding (EndUser, Admin, Legal, etc.)

**Dependencies:** A2

---

### **B. Database & Data Layer (P0)**

#### B1. SQL Database Schema Implementation
**Priority:** P0  
**Effort:** 3 days  
**Original:** #10, #11, #15, #16, #20, #25  
**Description:**
- Create all SQL tables (see database_schema.md)
- Setup Entity Framework migrations
- Seed initial data (roles, controls)
- Create indexes

**Tables:**
- Users, Roles, UserRoles
- Controls, Templates
- Transfers, Requirements
- Evidence, EvidenceHistory
- AuditTrail
- SLAConfigurations, SLATracking
- Notifications

**Dependencies:** A2

---

#### B2. SQL JSON Tables Setup
**Priority:** P0  
**Effort:** 1 day  
**Original:** #20 (partial)  
**Description:**
- Create SQL tables for dynamic data
- `TransferMERData` (JSON column)
- `ApplicationMetadata` (JSON column)
- `UserActivityLogs` (JSON column)

**Dependencies:** B1

---

#### B3. Blob Storage Configuration
**Priority:** P0  
**Effort:** 1 day  
**Original:** #9 (partial)  
**Description:**
- Create blob containers
- Configure lifecycle policies (archive old files)
- Setup access policies (SAS tokens)
- Enable soft delete

**Containers:**
- evidence-files
- template-files
- reports
- archived-data

**Dependencies:** A1

---

### **C. Core APIs - User & Access Control (P0)**

#### C1. User Management APIs
**Priority:** P0  
**Effort:** 2 days  
**Original:** #10 (partial)  
**Description:**
- GET /api/v1/users/me
- GET /api/v1/users
- POST /api/v1/users/{userId}/roles
- Azure AD user sync

**Dependencies:** B1, A3

---

### **D. Core APIs - Controls & Templates (P0)**

#### D1. Controls Management
**Priority:** P0  
**Effort:** 1 day  
**Original:** #15, #16  
**Description:**
- GET /api/v1/controls
- POST /api/v1/controls (Admin only)
- Seed MER-13, MER-14, ROCC, EUC controls

**Dependencies:** B1

---

#### D2. Template Management APIs
**Priority:** P0  
**Effort:** 3 days  
**Original:** Missing in original list  
**Description:**
- GET /api/v1/templates
- POST /api/v1/templates (multipart upload)
- PUT /api/v1/templates/{templateId}
- DELETE /api/v1/templates/{templateId}

**Dependencies:** B1, B3

---



### **E. Core APIs - Transfers & Requirements (P0)**

#### E1. Transfer Management APIs
**Priority:** P0  
**Effort:** 4 days  
**Original:** #21 (partial)  
**Description:**
- POST /api/v1/transfers
- GET /api/v1/transfers
- GET /api/v1/transfers/{transferId}
- PUT /api/v1/transfers/{transferId}
- Store MER template data in SQL JSON Column

**Dependencies:** B1, B2, D1

---

#### E2. Requirements Management
**Priority:** P0  
**Effort:** 2 days  
**Description:**
- GET /api/v1/transfers/{transferId}/requirements
- PUT /api/v1/requirements/{requirementId}
- Auto-create requirements on transfer submission

**Dependencies:** E1

---

### **F. Core APIs - Evidence Management (P0)**

#### F1. Evidence Upload APIs
**Priority:** P0  
**Effort:** 3 days  
**Original:** #9, #11  
**Description:**
- POST /api/v1/evidence (multipart upload)
- Upload to Azure Blob Storage
- Generate SAS tokens for secure access
- Virus scanning (Azure Defender)

**Dependencies:** B1, B3

---

#### F2. Evidence Retrieval APIs
**Priority:** P0  
**Effort:** 2 days  
**Original:** #22  
**Description:**
- GET /api/v1/transfers/{transferId}/evidence
- GET /api/v1/evidence/queue (Admin/Legal view)
- GET /api/v1/evidence/{evidenceId}/download
- GET /api/v1/evidence/{evidenceId}/preview

**Dependencies:** F1

---

### **G. Workflow & Review APIs (P0)**

#### G1. Evidence Review Workflow
**Priority:** P0  
**Effort:** 3 days  
**Original:** #23  
**Description:**
- POST /api/v1/evidence/{evidenceId}/review
- Support APPROVE, REJECT, ESCALATE decisions
- Update transfer/requirement statuses
- Create audit trail entries

**Dependencies:** F2, H1

---

#### G2. Transfer Review Workflow (MER)
**Priority:** P0  
**Effort:** 3 days  
**Original:** #24  
**Description:**
- POST /api/v1/transfers/{transferId}/review
- Review entire MER submission
- Attachment-level decisions
- Overall decision (APPROVE/REJECT/REQUEST_CHANGES)

**Dependencies:** E1, H1

---

#### G3. Escalation Workflow
**Priority:** P0  
**Effort:** 2 days  
**Original:** #24 (partial)  
**Description:**
- POST /api/v1/transfers/{transferId}/escalate
- POST /api/v1/evidence/{evidenceId}/escalate
- Support Legal/Business escalation
- Tag regulatory authorities

**Dependencies:** G1

---

#### G4. Deputy Assignment
**Priority:** P1  
**Effort:** 2 days  
**Original:** Missing  
**Description:**
- POST /api/v1/transfers/{transferId}/deputize
- Assign to Deputy-Legal or Deputy-Business
- Filter queue by assignedDeputy

**Dependencies:** G1

---



### **H. Audit Trail (P0)**

#### H1. Audit Trail Service
**Priority:** P0  
**Effort:** 2 days  
**Original:** Missing  
**Description:**
- Automatic audit logging middleware
- GET /api/v1/transfers/{transferId}/audit-trail
- GET /api/v1/evidence/{evidenceId}/audit-trail
- Store IP, user agent, change details

**Dependencies:** B1

---

### **I. Notifications (P0)**

#### I1. Notification Service
**Priority:** P0  
**Effort:** 3 days  
**Original:** #8, #25, #26  
**Description:**
- GET /api/v1/notifications
- POST /api/v1/notifications (internal)
- PUT /api/v1/notifications/{id}/read
- In-app notifications (database)

**Dependencies:** B1

---

#### I2. Email Notifications
**Priority:** P0  
**Effort:** 2 days  
**Original:** #8 (partial)  
**Description:**
- Azure Communication Services integration
- Email templates (approval, rejection, escalation)
- Background job using Azure Service Bus

**Dependencies:** I1, A1

---

#### I3. MS Teams Integration
**Priority:** P1  
**Effort:** 3 days  
**Original:** #8 (partial)  
**Description:**
- Microsoft Graph API integration
- Send Teams messages for critical events
- Adaptive Cards for rich notifications

**Dependencies:** I1

---

#### I4. Outlook Integration
**Priority:** P2  
**Effort:** 2 days  
**Original:** #8 (partial)  
**Description:**
- Create Outlook calendar events for SLA deadlines
- Task integration

**Dependencies:** I1

---

### **J. SLA Management (P0)**

#### J1. SLA Configuration APIs
**Priority:** P0  
**Effort:** 2 days  
**Original:** #12 (partial)  
**Description:**
- GET /api/v1/sla/configurations
- PUT /api/v1/sla/configurations/{id}
- Configure per control type

**Dependencies:** B1

---

#### J2. SLA Tracking Service
**Priority:** P0  
**Effort:** 3 days  
**Original:** #12  
**Description:**
- Background job to calculate SLA status
- Auto-create SLATracking records on transfer submission
- Update status (ON_TRACK, APPROACHING, BREACHED)
- Send notifications on approaching/breach

**Dependencies:** J1, I1

---

#### J3. SLA Monitoring APIs
**Priority:** P1  
**Effort:** 1 day  
**Description:**
- GET /api/v1/sla/breaches
- Dashboard data for SLA metrics

**Dependencies:** J2

---

### **K. External System Integration (P0)**

#### K1. SERA Integration
**Priority:** P0  
**Effort:** 3 days  
**Original:** #13, #17, #18  
**Description:**
- GET /api/v1/external/applications (from SERA)
- GET /api/v1/external/applications/{swcId}
- POST /api/v1/external/sync (manual sync)
- Cache in Cosmos DB (ApplicationMetadata)

**Dependencies:** B2

---

#### K2. iSAC Integration
**Priority:** P0  
**Effort:** 2 days  
**Original:** #13  
**Description:**
- Same as K1 but for iSAC system

**Dependencies:** B2

---

#### K3. Cumulus Integration
**Priority:** P0  
**Effort:** 2 days  
**Original:** #13  
**Description:**
- Same as K1 but for Cumulus system

**Dependencies:** B2

---

#### K4. AppChk Integration
**Priority:** P1  
**Effort:** 2 days  
**Original:** #13 (partial)  
**Description:**
- Application validation checks

**Dependencies:** B2

---

#### K5. Background Sync Job
**Priority:** P1  
**Effort:** 2 days  
**Description:**
- Scheduled job (daily) to sync all applications
- Azure Functions Timer Trigger

**Dependencies:** K1, K2, K3

---

### **L. Analytics & Reporting (P1)**

#### L1. Dashboard Analytics APIs
**Priority:** P1  
**Effort:** 2 days  
**Original:** Missing  
**Description:**
- GET /api/v1/analytics/dashboard
- Aggregate stats (pending, approved, rejected, etc.)
- Performance metrics

**Dependencies:** B1

---

#### L2. Compliance Reporting
**Priority:** P2  
**Effort:** 3 days  
**Description:**
- GET /api/v1/analytics/compliance-report
- Generate PDF/Excel reports
- Export to Azure Blob Storage

**Dependencies:** L1

---



### **N. Frontend (P0)**

#### N1. Central Inventory Dashboard
**Priority:** P0  
**Effort:** 5 days  
**Original:** #5  
**Description:**
- Step-by-step wizard
- Template selection and prefill
- Evidence upload
- Form validation

**Dependencies:** E1, F1, K1

---

#### N2. End User Dashboard
**Priority:** P0  
**Effort:** 4 days  
**Original:** #2  
**Description:**
- My Transfers view
- SLA tracking display
- Escalation button
- Audit trail modal

**Dependencies:** E1, H1

---

#### N3. Admin Dashboard
**Priority:** P0  
**Effort:** 5 days  
**Original:** #3  
**Description:**
- Evidence queue
- MER review panel
- Template upload
- Review workflows

**Dependencies:** G1, G2, D2

---

#### N4. Legal Dashboard
**Priority:** P0  
**Effort:** 4 days  
**Original:** #4  
**Description:**
- Escalated items view
- Review panel with escalation info
- Deputy assignments

**Dependencies:** G3, G4

---

#### N5. Business Dashboard
**Priority:** P1  
**Effort:** 3 days  
**Original:** #6  
**Description:**
- Similar to Legal dashboard
- Business-escalated items

**Dependencies:** G3

---



### **O. DevOps & Infrastructure (P0)**

#### O1. CI/CD Pipeline
**Priority:** P0  
**Effort:** 2 days  
**Description:**
- Azure DevOps pipelines
- Build, test, deploy
- Environment-specific configs
- Automated testing

**Dependencies:** A2

---

#### O2. Monitoring & Alerting
**Priority:** P0  
**Effort:** 2 days  
**Description:**
- Application Insights dashboards
- Custom alerts (API errors, SLA breaches)
- Log Analytics queries

**Dependencies:** A1

---

#### O3. Disaster Recovery
**Priority:** P1  
**Effort:** 2 days  
**Description:**
- Geo-replication setup
- Backup policies
- Recovery procedures documentation

**Dependencies:** A1

---

## Summary of Missing Items (Added)

| Item | Priority | Effort | Description |
|------|----------|--------|-------------|
| Deputy assignment (G4) | P1 | 2 days | Deputize workflow |
| Audit trail service (H1) | P0 | 2 days | Full audit logging |
| SLA configuration APIs (J1) | P0 | 2 days | Admin manages SLA configs |
| SLA monitoring (J3) | P1 | 1 day | Breach reports |
| Background sync (K5) | P1 | 2 days | Scheduled app sync |
| Dashboard analytics (L1) | P1 | 2 days | Aggregate metrics |
| Compliance reporting (L2) | P2 | 3 days | Exportable reports |
| Monitoring & alerting (O2) | P0 | 2 days | Observability |

---

## Effort Summary

| Component | Work Items | Total Days |
|-----------|------------|------------|
| Infrastructure | 3 | 7 |
| Database | 3 | 5 |
| User APIs | 1 | 2 |
| Controls & Templates | 3 | 7 |
| Transfers & Requirements | 2 | 6 |
| Evidence | 2 | 5 |
| Workflow | 4 | 10 |
| Audit | 1 | 2 |
| Notifications | 4 | 10 |
| SLA | 3 | 6 |
| External Integration | 5 | 12 |
| Analytics | 2 | 5 |
| Frontend | 5 | 21 |
| DevOps | 3 | 6 |
| **TOTAL** | **38** | **97 days** |

**Team Estimate:**
- 2 Backend Developers: ~2.5 months
- 2 Frontend Developers: ~1.5 months
- 1 DevOps Engineer: ~2 weeks
- 1 QA Engineer: ~1 month (concurrent)

---

## Implementation Phases

### **Phase 1: MVP (P0 items) - 8 weeks**
- Core infrastructure
- Basic CRUD operations
- Transfer submission workflow
- Evidence review
- SLA tracking
- Notifications
- Basic dashboards

### **Phase 2: Production Ready (P1 items) - 4 weeks**
- Template designer
- Deputy assignments
- MS Teams integration
- Analytics
- Monitoring
- External system sync

### **Phase 3: Enhancements (P2 items) - 2 weeks**
- Compliance reporting
- Advanced analytics
- Additional integrations

---

## Dependency Graph

```
A1 (Infrastructure) ───┐
                        ├──→ A2 (Backend Boilerplate) ──→ B1, B2, B3 (Databases)
A3 (Auth) ─────────────┘

B1 ──→ C1, D1, D2, E1, F1, G1, H1, I1, J1
B2 ──→ E1, K1, K2, K3
B3 ──→ D2, F1

D1, D2 ──→ E1 ──→ E2
E1 ──→ F1 ──→ F2 ──→ G1 ──→ G2, G3, G4
G1 ──→ H1, I1

J1 ──→ J2 ──→ J3
I1 ──→ I2, I3, I4

K1, K2, K3 ──→ K5
G1 ──→ L1 ──→ L2

E1, G1 ──→ M1, M2

All APIs ──→ Frontend (N1-N6)
A2 ──→ O1, O2, O3
```
