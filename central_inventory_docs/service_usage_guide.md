# Central Inventory - Service Usage Guide

This document explains the specific role and responsibilities of each backend service as depicted in the sequence diagrams.

## 1. Template Service (`TplSvc`)
**Role:** Dynamic Form Engine
**Used In:** End User Submission

*   **Responsibilities:**
    *   **Fetch Active Template**: Retrieves the correct JSON schema for a control (e.g., MER-13 vs MER-14).
    *   **Version Management**: Ensures users are filling out the latest version of a template.
    *   **Structure Delivery**: Returns the form definition (fields, validation rules, sections) to the frontend.

## 2. Evidence Service (`EvSvc`)
**Role:** File & Metadata Manager
**Used In:** Submission, Admin Review, Legal Review

*   **Responsibilities:**
    *   **Secure Uploads**: Handles file uploads to Azure Blob Storage and generates SAS tokens.
    *   **Metadata Storage**: Stores file details (filename, size, uploader) in the SQL `Evidence` table.
    *   **Queue Management**: Provides filtered lists of evidence for Admin and Legal dashboards (e.g., "Pending", "Escalated").
    *   **Access Control**: Ensures only authorized users (or deputies) can download/preview specific files.

## 3. Transfer Service (`TranSvc`)
**Role:** Core Entity Manager
**Used In:** Submission, Legal Completion

*   **Responsibilities:**
    *   **Creation Transaction**: Orchestrates the complex creation of a Transfer, including:
        *   Main `Transfer` record.
        *   Dynamic `TransferMERData` (JSON).
        *   Associated `Requirements`.
        *   Initial `SLA Tracking` record.
    *   **Status Orchestration**: Checks if a transfer is "Complete" by verifying the status of all its child Requirements.
    *   **Data Integrity**: Ensures strict consistency between the relational Transfer data and the dynamic JSON form data.

## 4. Workflow Service (`Workflow`)
**Role:** State Transition Engine
**Used In:** Admin Review, Legal Review

*   **Responsibilities:**
    *   **Review Processing**: Handles `APPROVE` and `REJECT` actions on evidence.
    *   **Escalation Logic**: Manages the `ESCALATE` action:
        *   Updates status to `ESCALATED`.
        *   Tags the appropriate authority (Legal, Business).
        *   Records escalation reasons.
    *   **Audit Logging**: Automatically records every state change (who, when, what) into the `AuditTrail` table.
    *   **Deputy Routing**: Handles assignment of escalated items to specific deputies.

## 5. Notification Service (`NotifSvc`)
**Role:** Communication Manager
**Used In:** All Workflows

*   **Responsibilities:**
    *   **In-App Alerts**: Stores notifications in the SQL `Notifications` table for display in the User/Admin dashboards.
    *   **Email Delivery**: Publishes events to Azure Service Bus (which triggers email sending functions).
    *   **Event Handling**: Listens for key triggers:
        *   `SubmitSuccess` (Notify Admin team).
        *   `StatusChange` (Notify End User).
        *   `Escalated` (Notify Legal team).
        *   `TransferCompleted` (Notify End User).

---

## Service Interaction Summary

| Feature | Primary Service | Helper Services |
| :--- | :--- | :--- |
| **User loads page** | `TplSvc` | `APIM` (Auth) |
| **User uploads file** | `EvSvc` | `Blob Storage` |
| **User submits form** | `TranSvc` | `NotifSvc` |
| **Admin reviews** | `Workflow` | `EvSvc`, `NotifSvc` |
| **Legal approves** | `Workflow` | `TranSvc`, `NotifSvc` |
