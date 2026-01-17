# Central Inventory - Sequence Diagrams

## 1. End User Submission Workflow (MER)

This diagram illustrates the flow when an End User fills out an MER template, uploads evidence, and submits a transfer request.

```mermaid
sequenceDiagram
    autonumber
    actor User as End User
    participant Client as React SPA
    participant APIM as API Gateway
    participant TplSvc as Template Service
    participant EvSvc as Evidence Service
    participant TranSvc as Transfer Service
    participant NotifSvc as Notification Service
    participant DB as SQL Database
    participant Blob as Azure Blob Storage

    %% 1. Load Template
    User->>Client: Select Control (MER-13)
    Client->>APIM: GET /api/v1/templates?controlId=1
    APIM->>TplSvc: GetActiveTemplate(controlId)
    TplSvc->>DB: Query Template Metadata
    DB-->>TplSvc: Template Details
    TplSvc-->>Client: Template Structure (JSON)

    %% 2. Fill Form
    User->>Client: Fill Dynamic Form (App ID, etc.)
    Client->>Client: Validate Form Data

    %% 3. Upload Evidence (Optional)
    opt Upload Supporting Evidence
        User->>Client: Select File
        Client->>APIM: POST /api/v1/evidence
        APIM->>EvSvc: UploadEvidence(file)
        EvSvc->>Blob: Upload File
        Blob-->>EvSvc: Blob URL
        EvSvc->>DB: Insert Evidence Record
        EvSvc-->>Client: Evidence ID
    end

    %% 4. Submit Transfer
    User->>Client: Click Submit
    Client->>APIM: POST /api/v1/transfers
    APIM->>TranSvc: CreateTransfer(payload)
    
    note right of TranSvc: Payload includes MER Data <br/> & Requirement List
    
    TranSvc->>DB: Begin Transaction
    TranSvc->>DB: Insert Transfer Record
    TranSvc->>DB: Insert TransferMERData (JSON)
    TranSvc->>DB: Insert Requirement Rows
    TranSvc->>DB: Create SLA Tracking Record
    TranSvc->>DB: Commit Transaction

    %% 5. Notifications
    TranSvc->>NotifSvc: SendNotification(SubmitSuccess)
    NotifSvc->>DB: Store In-App Notification
    NotifSvc-->>Client: 201 Created

    par Notify Admin
        NotifSvc->>DB: Create Admin Notification
        NotifSvc->>NotifSvc: Publish to Service Bus (Email)
    end
    
    Client-->>User: Show Success Message
```

---

## 2. Admin Review & Escalation Workflow

This diagram shows an Admin reviewing an item from the queue, deciding to approve one evidence and escalate another to Legal.

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Client as React SPA
    participant APIM as API Gateway
    participant EvSvc as Evidence Service
    participant Workflow as Workflow Service
    participant DB as SQL Database
    participant NotifSvc as Notification Service

    %% 1. Fetch Queue
    Admin->>Client: Open Dashboard
    Client->>APIM: GET /api/v1/evidence/queue
    APIM->>EvSvc: GetEvidenceQueue()
    EvSvc->>DB: Query Pending Items
    DB-->>EvSvc: List of Items
    EvSvc-->>Client: Evidence List

    %% 2. Review Item (Approve)
    Admin->>Client: Review Item A -> Approve
    Client->>APIM: POST /api/v1/evidence/{id}/review
    APIM->>Workflow: SubmitReview(decision=APPROVE)
    Workflow->>DB: Update Evidence Status (APPROVED)
    Workflow->>DB: Insert Audit Log
    Workflow->>DB: Check Transfer Completion?
    Workflow-->>Client: Success

    %% 3. Review Item (Escalate)
    Admin->>Client: Review Item B -> Escalate to Legal
    Client->>APIM: POST /api/v1/transfers/{id}/escalate
    APIM->>Workflow: EscalateTransfer(to=Legal)
    
    Workflow->>DB: Update Transfer Status (ESCALATED)
    Workflow->>DB: Update Escalation Metadata (Reason, Tags)
    Workflow->>DB: Insert Audit Log

    %% 4. Notify Parties
    par Notify Legal
        Workflow->>NotifSvc: SendNotification(Escalated)
        NotifSvc->>DB: Create Legal Notification
    and Notify End User
        Workflow->>NotifSvc: SendNotification(StatusChange)
        NotifSvc->>DB: Create User Notification
    end

    Workflow-->>Client: Success
    Client-->>Admin: Updates Queue View
```

---

## 3. Legal Review & Completion Workflow

This diagram flow shows a Legal user finding an escalated item, reviewing it, and marking it as complete.

```mermaid
sequenceDiagram
    autonumber
    actor Legal as Legal User
    participant Client as React SPA
    participant APIM as API Gateway
    participant EvSvc as Evidence Service
    participant Workflow as Workflow Service
    participant TranSvc as Transfer Service
    participant DB as SQL Database
    participant NotifSvc as Notification Service

    %% 1. View Escalations
    Legal->>Client: Open Legal Dashboard
    Client->>APIM: GET /api/v1/evidence/queue?status=ESCALATED
    APIM->>EvSvc: GetEscalatedItems()
    EvSvc->>DB: Query Escalated Evidence
    DB-->>EvSvc: List of Items
    EvSvc-->>Client: Escalation Queue

    %% 2. Review & Approve
    Legal->>Client: Review Details -> Approve
    Client->>APIM: POST /api/v1/evidence/{id}/review
    APIM->>Workflow: SubmitReview(decision=APPROVE)
    
    Workflow->>DB: Update Evidence Status (APPROVED)
    Workflow->>DB: Clear Escalation Flags
    Workflow->>DB: Insert Audit Log

    %% 3. Check Completion
    Workflow->>TranSvc: CheckTransferStatus(transferId)
    TranSvc->>DB: Check All Requirements Status
    
    alt All Requirements Approved
        TranSvc->>DB: Update Transfer Status (COMPLETED)
        TranSvc->>NotifSvc: SendNotification(TransferCompleted)
        NotifSvc->>DB: Notify End User
    else Some Pending/Rejected
        TranSvc->>DB: Update Transfer Status (ACTIVE)
    end

    Workflow-->>Client: Success
    Client-->>Legal: Item Removed from Queue
```
