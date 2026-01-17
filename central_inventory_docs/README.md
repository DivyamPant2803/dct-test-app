# Central Inventory - Documentation Package

This folder contains the complete design, architecture, and implementation specifications for the Central Inventory feature.

## 🚀 Start Here
*   **[central_inventory_master_context.md](./central_inventory_master_context.md)**: **The Source of Truth**. Read this first. It consolidates the architecture, schema, APIs, and workflows into one context file.

## 🏗️ Architecture & Database
*   **[database_schema.md](./database_schema.md)**: Full SQL `CREATE` scripts & JSON structures.
*   **[backend_architecture_review.md](./backend_architecture_review.md)**: Original gap analysis and architecture decisions.
*   **[api_specifications.md](./api_specifications.md)**: Request/Response schemas for all 60+ endpoints.
*   **[database_strategy_for_reporting.md](./database_strategy_for_reporting.md)**: Why we chose SQL Hybrid for reporting.
*   **[sql_extensibility_guide.md](./sql_extensibility_guide.md)**: How the SQL JSON column handles new template types.
*   **[sql_vs_nosql_data_flow.md](./sql_vs_nosql_data_flow.md)**: Explaining the Data Flow transparency to UI.
*   **[sql_vs_nosql_storage_mechanics.md](./sql_vs_nosql_storage_mechanics.md)**: Why we chose SQL over NoSQL (Transactions).

## 🛠️ Implementation Guides
*   **[implementation_guide_sql_json.md](./implementation_guide_sql_json.md)**: **Code Snippets** for React & .NET (JSON Serialization).
*   **[service_usage_guide.md](./service_usage_guide.md)**: Responsibilities of each backend service.
*   **[escalation_reporting_guide.md](./escalation_reporting_guide.md)**: How to build reports for Escalations & Transfers.

## 📊 Workflows & Diagrams
*   **[workflow_diagram.md](./workflow_diagram.md)**: End-to-end flowchart.
*   **[sequence_diagrams.md](./sequence_diagrams.md)**: Sequence diagrams for key user flows.
*   **Raw Mermaid Files**: `end_user_submission.mmd`, `admin_review.mmd`, `legal_review.mmd`

## ✅ Task List
*   **[refined_work_items.md](./refined_work_items.md)**: Detailed breakdown of tasks with dependencies.
*   **[central_inventory_work_items.csv](./central_inventory_work_items.csv)**: CSV export of tasks for Jira/DevOps.
*   **[changes_summary.md](./changes_summary.md)**: Log of changes made during the design phase.

---

> **For AI Coding Agents**: Feed the `central_inventory_master_context.md` file first to establish context, then refer to specific files above for deep-dive implementation details.
