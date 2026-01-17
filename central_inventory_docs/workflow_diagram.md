# Central Inventory - Workflow Diagram

```mermaid
flowchart TD
    %% Swimlanes via Subgraphs
    subgraph EndUser [End User - Central Inventory]
        Start([Start]) --> SelectControl{Select Control}
        
        %% MER Path
        SelectControl -- MER Control --> MERType[Select MER Type\n(MER-13 / MER-14)]
        MERType --> AppID[Application Identification\n(Auto-prefill from SERA)]
        AppID --> FillTemplate[Fill Dynamic Template]
        FillTemplate --> UploadEv[Upload Evidence\n(Optional)]
        UploadEv --> SubmitMER[Submit MER Request]
        
        %% Non-MER Path
        SelectControl -- Non-MER Control --> TransDetails[Enter Transfer Details]
        TransDetails --> Questionnaire[Fill Questionnaire]
        Questionnaire --> UploadReqEv[Upload Required Evidence]
        UploadReqEv --> SubmitGen[Submit Transfer Request]
    end

    subgraph System [System Backend Services]
        SubmitMER --> CreateTransfer[Create Transfer Record\n(Status: PENDING)]
        SubmitGen --> CreateTransfer
        
        CreateTransfer --> StoreSQL[Store Metadata in SQL]
        CreateTransfer --> StoreJSON[Store Dynamic Data in SQL JSON]
        CreateTransfer --> SLAStart[Start SLA Timer]
        CreateTransfer --> NotifyAdmin[Notify Admin Team]
        
        %% SLA Monitor
        SLAStart -.-> SLACheck{SLA Monitor}
        SLACheck -- Approaching Deadline --> NotifyWarn[Send Warning Notification]
        SLACheck -- Breach --> NotifyBreach[Send Breach Notification\n& Auto-Escalate?]
    end

    subgraph Admin [Admin Dashboard]
        NotifyAdmin --> EvidenceQueue[Evidence Queue]
        EvidenceQueue --> SelectItem[Select Item to Review]
        SelectItem --> ReviewPanel[Review Details & Evidence]
        
        ReviewPanel --> AdminDecision{Decision?}
        
        AdminDecision -- Request Clarification --> Clarification[Request Clarification]
        Clarification --> NotifyUserClarify[Notify End User]
        NotifyUserClarify -.-> |User Responds| ReviewPanel
        
        AdminDecision -- Reject --> StatusRejected[Update Status: REJECTED]
        AdminDecision -- Approve --> CheckRef[Check Remaining Requirements]
        AdminDecision -- Escalate --> AddEscalation[Add Escalation Reason\n& Tag Authorities]
    end

    subgraph Legal [Legal / Deputy / Business Dashboard]
        AddEscalation --> StatusEscalated[Update Status: ESCALATED]
        StatusEscalated --> NotifyLegal[Notify Legal/Business]
        NotifyLegal --> LegalQueue[Escalation Queue]
        LegalQueue --> LegalReview[Review Escalation]
        LegalReview --> LegalDecision{Legal Decision?}
        
        LegalDecision -- Approve --> LegalApprove[Mark as APPROVED by Legal]
        LegalDecision -- Reject --> StatusRejected
    end

    subgraph Final [Completion State]
        LegalApprove --> CheckRef
        
        CheckRef -- More Items Pending --> StatusActive[Status: ACTIVE/PARTIAL]
        CheckRef -- All Items Approved --> StatusCompleted[Status: COMPLETED]
        
        StatusRejected --> NotifyEndUser[Notify End User: Rejected]
        StatusCompleted --> NotifyEndUserSuccess[Notify End User: Completed]
        
        NotifyEndUser --> End([End])
        NotifyEndUserSuccess --> End
    end

    %% Styling
    classDef user fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef system fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;
    classDef admin fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef legal fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef final fill:#fafafa,stroke:#9e9e9e,stroke-width:2px;

    class Start,SelectControl,MERType,AppID,FillTemplate,UploadEv,SubmitMER,TransDetails,Questionnaire,UploadReqEv,SubmitGen,Clarification,NotifyUserClarify user;
    class CreateTransfer,StoreSQL,StoreJSON,SLAStart,NotifyAdmin,SLACheck,NotifyWarn,NotifyBreach system;
    class EvidenceQueue,SelectItem,ReviewPanel,AdminDecision,AddEscalation admin;
    class StatusEscalated,NotifyLegal,LegalQueue,LegalReview,LegalDecision,LegalApprove legal;
    class StatusRejected,CheckRef,StatusActive,StatusCompleted,NotifyEndUser,NotifyEndUserSuccess,End final;
```
