# Central Inventory Backend Architecture Review

## Architecture Diagram Overview

![Architecture Diagram](/Users/divyampant/.gemini/antigravity/brain/24236b4a-4036-4b9e-8876-3c85e03d2eba/uploaded_image_0_1768237511704.png)

![Work Items](/Users/divyampant/.gemini/antigravity/brain/24236b4a-4036-4b9e-8876-3c85e03d2eba/uploaded_image_1_1768237511704.jpg)

---

## Current Architecture Components

### **Client Layer**
- React SPA (Frontend application)

### **Edge & Security**
- Azure Front Door (CDN, WAF, routing)
- Azure AD (SSO authentication)

### **API Layer**
- Azure API Management (Gateway, rate limiting, policies)

### **Backend Services (.NET)**
- **Main .NET API** with 6 microservices/modules:
  1. Notification Service
  2. Aggregation Service
  3. MER Template Engine
  4. SLA Monitor
  5. Workflow Service
  6. Evidence Service

### **External Systems Integration**
- SERA
- i-SAC
- Cumulus
- AppChk (Application Check)

### **Data & Storage Layer**
- Azure SQL DB
- Azure Cosmos DB
- Azure Blob Storage
- Azure Cache for Redis
- Azure Cognitive Search
- Application Insights (App Insights) Analytics

---

## Gap Analysis

### ✅ **Strengths**
1. Good separation of concerns with microservices
2. Proper edge security with Azure Front Door + Azure AD
3. Comprehensive data layer with SQL, NoSQL, blob storage
4. External system integration planned
5. Monitoring with Application Insights

### ⚠️ **Critical Gaps Identified**

#### 1. **Missing Service Components**
- ❌ **Audit Trail Service** - No dedicated service for audit logging
- ❌ **Template Management Service** - MER Template Engine exists but no template versioning/lifecycle management
- ❌ **User Management Service** - No service to manage users, roles, permissions

#### 2. **Database Schema Gaps**
- ❌ No tables defined for:
  - Transfer/Request lifecycle management
  - Requirement tracking
  - Audit trail entries
  - Template versioning
  - Escalation history
  - Deputy assignments
  - SLA configurations (only monitoring mentioned)
  - Role-based permissions

#### 3. **API Endpoint Gaps**
- ❌ Missing APIs for:
  - Deputy assignment workflow
  - Escalation workflow with tags
  - Audit trail queries
  - Analytics/dashboard data
  - Clarification requests
  - Document previews

#### 4. **Integration Gaps**
- ❌ No message queue/service bus for async operations
- ❌ No caching strategy defined for frequently accessed data
- ❌ No blob storage lifecycle policy mentioned

#### 5. **Security & Compliance Gaps**
- ❌ No encryption at rest/in transit explicitly mentioned
- ❌ No data retention policy service
- ❌ No PII masking/data anonymization service
- ❌ No audit log retention and archival strategy

#### 6. **Observability Gaps**
- ❌ No distributed tracing (e.g., Azure Monitor with OpenTelemetry)
- ❌ No alerting service for SLA breaches
- ❌ No health check endpoints mentioned

---

## Refined Architecture Proposal

### **Additional Services Recommended**

```
Main .NET API
├── Notification Service ✅
├── Aggregation Service ✅
├── MER Template Engine ✅
├── SLA Monitor ✅
├── Workflow Service ✅
├── Evidence Service ✅
├── 🆕 Audit Service (new)
├── 🆕 Template Management Service (new)
└── 🆕 User Management Service (new)
```

**Future Enhancements (Not MVP):**
```
├── 📅 File Processing Service (PDF parsing, OCR) - Phase 3
├── 📅 Reporting & Analytics Service - Phase 3
└── 📅 AI Integration Service - Phase 3
```

### **Additional Infrastructure Components**

```
Data & Storage
├── Azure SQL DB ✅
├── Azure Blob Storage ✅
├── Azure Cache for Redis ✅
├── Azure Cognitive Search ✅
├── Application Insights ✅
├── 🆕 Azure Service Bus (message queue for async workflows)
├── 🆕 Azure Key Vault (secrets, certificates)
└── 🆕 Azure Monitor (alerts, distributed tracing)
```

**Future Infrastructure (Phase 3):**
```
└── 📅 Azure Document Intelligence (PDF parsing, OCR for template auto-generation)
```

---

## Database Schema Design

### **Recommended Database Strategy**

**Azure SQL Database** (Relational + JSON)
- Core business entities: Users, Transfers, Requirements, Evidence
- Dynamic data (previously NoSQL): MER template data (JSON column)
- Audit trails, Logs
- Application metadata cache

**Azure Blob Storage**
- Evidence files (PDFs, documents)
- Template PDF files
- Exported reports

**Azure Cache for Redis**
- Session management
- Frequently accessed reference data (controls, jurisdictions)
- API response caching

---

## Detailed Table Schemas

*See next section for comprehensive schema definitions*

---

## API Endpoint Design

*See next section for complete API specifications*

---

## Work Items Analysis

### **Mapped to Architecture Components**

| Work Item | Component | Notes |
|-----------|-----------|-------|
| #1-6: Dashboards | Frontend | ✅ Well-scoped |
| #7: Backend boilerplate | Main .NET API | ✅ Foundation |
| #8: MS Teams/Outlook notifications | Notification Service | ⚠️ Need Azure Logic Apps or Graph API integration |
| #9: Store evidences | Evidence Service + Blob Storage | ✅ Correct approach |
| #10: User table | User Management Service | ⚠️ Consider Azure AD B2C integration |
| #11: Evidence table | Evidence Service | ✅ Needed |
| #12: SLA API | SLA Monitor Service | ⚠️ Need SLA configuration table |
| #13: Fetch from SERA/iSAC/Cumulus | Aggregation Service | ✅ Correct |
| #14: Configure roles | User Management Service | ⚠️ Use Azure AD roles or custom RBAC |
| #15-16: Control tables | Template Management Service | ✅ Needed |
| #17-18: Application APIs | Aggregation Service | ✅ Good |
| #19: Prefill template | Frontend + Template Engine | ✅ Hybrid approach |
| #20-21: Save AC-13/14 data | MER Template Engine | ✅ Good |
| #22: Fetch evidences | Evidence Service | ✅ Good |
| #23: Approve/Reject evidence | Workflow Service | ✅ Good |
| #24: Approve/Reject/Escalate request | Workflow Service | ✅ Good |
| #25-26: Notification table & APIs | Notification Service | ✅ Good |

### **Missing Work Items**

| Missing Item | Priority | Component |
|--------------|----------|-----------||
| Audit trail APIs | HIGH | Audit Service |
| Deputy assignment workflow | MEDIUM | Workflow Service |
| Escalation with tags | MEDIUM | Workflow Service |
| Analytics & reporting dashboard | MEDIUM | Aggregation Service |
| Health check endpoints | HIGH | All services |
| Data retention policies | MEDIUM | Evidence Service |

---

## Next Steps

1. **Review Detailed Schema** (see database_schema.md)
2. **Review API Specifications** (see api_specifications.md)
3. **Prioritize Missing Work Items**
4. **Define Service Boundaries** more clearly
5. **Create Infrastructure as Code** (Bicep/ARM templates)
6. **Define CI/CD Pipeline**

