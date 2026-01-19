# Central Inventory - Frontend Implementation Guide

> **For AI Agents**: This document specifies the UI/UX and technical implementation details for the Central Inventory feature. Use this to generate React components that match the existing application's style and architecture.

---

## 1. Technical Stack & Standards

### **Core Stack**
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: `styled-components` (Strict requirement. Do not use Tailwind/CSS Modules).
*   **State Management**: React Context (Global), `react-query` (Server State).
*   **Routing**: `react-router-dom`.
*   **Icons**: `react-icons/fi` (Feather Icons).

### **Design System**
*   **Tokens**: Import from `@styles/designTokens` (colors, spacing, shadows, borderRadius).
*   **Layout**:
    *   **Container**: `AppContainer` (Full screen, no scroll on body).
    *   **Header**: Fixed 60px height.
    *   **Sidebar**: `NavBar` component.
    *   **Main**: Scrollable area `calc(100vh - 60px)`.

---

## 2. Page Architecture

### **2.1 Route Structure**
| Path | Component | Purpose |
| :--- | :--- | :--- |
| `/central-inventory` | `CentralInventoryPage` | Landing page, "Start New Transfer" wizard. |
| `/my-transfers` | `EndUserDashboard` | User's active/completed transfers. |
| `/admin` | `AdminDashboard` | Admin queue & management. |
| `/legal` | `LegalDashboard` | Legal escalation queue. |
| `/business` | `BusinessDashboard` | Business escalation queue. |

### **2.2 Component Hierarchy**
```
src/
├── pages/
│   ├── CentralInventory/        # Main Container
│   │   ├── WizardStep1.tsx      # Control Selection
│   │   ├── WizardStep2.tsx      # Dynamic Form
│   │   └── WizardStep3.tsx      # Evidence Upload
├── components/
│   ├── CentralInventory/
│   │   ├── DynamicTemplateForm/ # The JSON Form Engine
│   │   ├── TransferCard.tsx     # Summary Card
│   │   └── StatusBadge.tsx      # Standardized Status Chips
│   ├── MERReview/
│   │   ├── MERReviewPanel.tsx   # (Existing) Admin Review UI
│   │   └── ReviewSidebar.tsx    # Details & Metadata
```

---

## 3. Detailed UI Specifications

### **3.1 End User Dashboard** (`/my-transfers`)
*   **Layout**: Grid Layout (Cards).
*   **Header**: "My Transfers" + "Create New" Button.
*   **Card Content**:
    *   Transfer Name (Bold).
    *   Status Badge (PENDING=Gray, ACTIVE=Blue, APPROVED=Green, REJECTED=Red).
    *   "Action Required" Indicator (if clarification requested).
    *   Progress Bar (SLA Tracking).

### **3.2 Start New Transfer Wizard** (`/central-inventory`)
*   **UX Pattern**: Stepper (Circles with labels).
*   **Step 1: Selection**
    *   Dropdown: "Select Control" (MER-13, ROCC).
    *   Radio: "Template Type" (Standard vs High Risk).
*   **Step 2: Dynamic Form**
    *   **Component**: `DynamicTemplateForm`.
    *   **Input**: Takes `schema` (JSON) from API.
    *   **Output**: Generates `merTemplateData` object.
*   **Step 3: Evidence**
    *   Drag & Drop Zone (use `react-dropzone`).
    *   List of uploaded files with "Remove" icon.

### **3.3 Admin Review Panel** (`MERReviewPanel`)
*(Refer to `src/components/MERReview/MERReviewPanel.tsx` for existing implementation)*
*   **Layout**: Split Screen.
    *   **Left**: Form Data (Read-only view).
    *   **Right**: Evidence & Attachments.
*   **Actions**:
    *   Floating Footer Actions: "Approve", "Reject", "Escalate".
    *   Escalate Modal: Dropdown (Legal/Business), Textarea (Reason).

### **3.4 Legal Dashboard** (`/legal`)
*   **Layout**: Table View (High density).
*   **Columns**:
    *   Transfer ID
    *   Escalated By (User Name)
    *   Date Escalated
    *   Reason (Truncated)
    *   Actions (Review Button)
*   **Filters**: "My Assignments", "All Escalations".

---

## 4. State Management Patterns

### **4.1 Fetching Data (React Query)**
```typescript
// hooks/useTransfers.ts
export const useTransfers = (status: string) => {
  return useQuery(['transfers', status], () => 
    api.get(`/transfers?status=${status}`)
  );
};
```

### **4.2 Form State**
*   **Do not use Redux.**
*   Use local state inside the Wizard container:
    ```typescript
    const [wizardData, setWizardData] = useState({
      step: 1,
      controlId: null,
      merTemplateData: {}, // Dynamic JSON
      evidenceFiles: []
    });
    ```

---

## 5. UI/UX Rules for AI Agents

1.  **Styled Components Only**: Never use inline styles for layout. Define components at the bottom of the file or in a separate file.
2.  **Responsive**: Panels should flex. Use `flex: 1` for main content areas.
3.  **Loading States**: Always show a Skeleton or Spinner (`LoadingState` component) while fetching.
4.  **Error Handling**: Use `ToastProvider` for success/error messages (`toast.success("Transfer Created")`).
5.  **Theme Consistency**: Use `colors.background.default` (#242424 in dark mode) and `colors.text.primary`. Do not hardcode hex values.
