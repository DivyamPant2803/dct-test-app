# Central Inventory Dashboard Design Specification

## Overview
This document provides a comprehensive design specification for implementing the **Admin**, **Legal**, **Business**, and **End User** dashboards for the Central Inventory system. The dashboards share a common modular architecture while each serving distinct user roles with specialized functionality.

---

## Architecture Overview

### Dashboard Layout Pattern
All dashboards utilize a clean, full-width layout that provides:
- **Top Navigation/Tabs**: Horizontal navigation for switching between views
- **Main Content Area**: Full-width content display based on active selection
- **Optional Header Content**: Stats bars, filters, or breadcrumbs

### Common Component Structure
```
DashboardContainer
└── MainContent
    ├── NavigationTabs (horizontal tab bar)
    ├── HeaderContent (optional - stats, filters)
    └── Children (active view content)
```

---

## Design System & Visual Language

### Color Palette
- **Background**: `#f5f5f5` (light gray)
- **Card Background**: `white`
- **Borders**: `#e0e0e0` (light), `#eee` (very light)
- **Text Primary**: `#222`, `#333`
- **Text Secondary**: `#666`, `#888`
- **Hover States**: `#f8f8f8`, `#f9f9f9`, `#f0f0f0`

### Status Colors
- **Pending**: `#FFA000` (amber/orange)
- **Under Review**: `#2196F3` (blue)
- **Approved**: `#4CAF50` (green)
- **Rejected**: `#F44336` (red)
- **Escalated**: `#9C27B0` (purple)

### Typography
- **Headers**: `font-weight: 600`, `font-size: 0.9rem - 1rem`
- **Body Text**: `font-size: 0.85rem - 0.9rem`
- **Small Text**: `font-size: 0.75rem - 0.8rem`
- **Monospace IDs**: `font-family: monospace`

### Spacing & Layout
- **Card Padding**: `1.25rem`
- **Section Gap**: `1.5rem`
- **Border Radius**: `12px` (cards), `6px` (smaller elements), `4px` (buttons)
- **Box Shadow**: `0 2px 8px rgba(0,0,0,0.06)`

---

## Component Specifications

### 1. Tab Navigation Component

**Visual Design:**
- Horizontal tab bar at the top of the dashboard
- Full-width or contained layout
- Clean, minimal design with clear active state
- Optional secondary navigation for sub-sections

**Structure:**
```
TabNavigation
└── TabList
    └── Tab (clickable, highlights when active)
```

**Tab Styling:**
- Padding: `1rem 1.5rem`
- Font size: `0.9rem`
- Font weight: `500`
- Border bottom: `2px solid transparent` (default)
- Transition: `all 0.2s ease`

**Interaction States:**
- **Default**: Light text (`#666`), no border
- **Hover**: Darker text (`#333`), subtle background (`#f8f8f8`)
- **Active**: Dark text (`#222`), colored border bottom (e.g., `#2196F3`), bold font weight (`600`)

**Layout Options:**
- **Horizontal Tabs**: Single row, scrollable if needed
- **Grouped Tabs**: Sections with dividers for logical grouping
- **Sticky Header**: Tabs remain visible on scroll

---

### 2. Dashboard Stats Component

**Visual Design:**
- Grid layout with equal-width cards
- Each stat card contains:
  - Icon (top-left or left-aligned)
  - Large numeric value
  - Label text
  - Subtext (smaller, lighter color)
  - Optional highlight state (colored border or background)

**Layout:**
- Responsive grid: 2-4 columns depending on screen size
- Gap between cards: `1rem`
- Card padding: `1rem - 1.25rem`
- Border radius: `8px - 12px`

**Example Stats:**
- Total items count
- High priority count (with alert icon)
- Status breakdowns
- SLA metrics

**Highlight State:**
- Used for urgent/attention items
- Colored left border (4px) or subtle background tint
- Icon color matches highlight color

---

### 3. Table Component

**Visual Design:**
- Full-width, bordered table
- Alternating row hover states
- Sticky header (optional)
- Responsive column widths

**Header Row:**
- Background: `#f8f8f8`
- Font weight: `500`
- Padding: `0.75rem 1rem`
- Border bottom: `2px solid #eee`
- Text align: Left
- White-space: `nowrap` for column headers

**Body Rows:**
- Padding: `0.5rem 1rem`
- Border bottom: `1px solid #eee`
- Hover background: `#f9f9f9`
- Vertical align: `top`

**Cell Content Patterns:**
- **Primary Text**: Bold, larger font
- **Secondary Text**: Smaller, lighter color, below primary
- **IDs**: Monospace font, smaller size
- **Badges**: Inline status/priority indicators
- **Actions**: Button group, right-aligned

---

### 4. Status Chips/Badges

**Visual Design:**
- Small, rounded rectangles
- Uppercase text
- Color-coded by status
- Padding: `0.2rem 0.4rem` to `0.3rem 0.6rem`
- Font size: `0.65rem - 0.75rem`
- Font weight: `500`
- Letter spacing: `0.3px`

**Status Variants:**
- **PENDING**: Orange background, white text
- **UNDER_REVIEW**: Blue background, white text
- **APPROVED**: Green background, white text
- **REJECTED**: Red background, white text
- **ESCALATED**: Purple background, white text

---

### 5. Priority Badges

**Visual Design:**
- Similar to status chips but with priority levels
- Color-coded:
  - **High**: Red (`#F44336`)
  - **Medium**: Amber (`#FFA000`)
  - **Low**: Green (`#4CAF50`)

---

### 6. SLA Badges

**Visual Design:**
- Indicates time-sensitive status
- Three states:
  - **Breached**: Red, shows "Xd overdue"
  - **Approaching**: Orange/Amber, shows "Xd left"
  - **OK**: Green, shows "On track"

---

### 7. Action Buttons

**Visual Design:**
- Rounded corners: `4px`
- Padding: `0.4rem 0.8rem`
- Font size: `0.8rem`
- Font weight: `500`
- Transition: `all 0.2s ease`

**Variants:**
- **Primary**: Dark background (`#222`), white text
  - Hover: `#444`
- **Secondary**: White background, dark text, border
  - Hover: `#f8f8f8`
- **Danger**: Red background, white text
  - Hover: Darker red
- **Disabled**: `opacity: 0.5`, cursor not-allowed

**Button Groups:**
- Multiple buttons in a row
- Gap: `0.5rem`
- Right-aligned in table cells

---

### 8. Filters Section

**Visual Design:**
- Horizontal layout above tables
- Multiple filter groups side-by-side
- Each filter has:
  - Label (above or left)
  - Dropdown/select component
  - Consistent styling

**Layout:**
- Margin bottom: `1rem`
- Gap between filters: `1rem`
- Filter label: `font-size: 0.85rem`, `color: #666`

---

### 9. Empty States & Loading States

**Empty State:**
- Centered text
- Height: `200px`
- Color: `#666`
- Font size: `0.9rem`
- Message: Contextual (e.g., "No evidence found")

**Loading State:**
- Same styling as empty state
- Message: "Loading [content]..."
- Optional spinner icon

---

## Dashboard-Specific Implementations

### Admin Dashboard

**Navigation Tabs:**
- Evidence Queue
- My Reviews
- All Transfers
- AI Insights
- Document Library
- Template Upload
- Publish Summary
- Change Requests

**Key Features:**

#### Evidence Queue View
- **Stats Bar**: 4 cards showing queue metrics
  - Total items
  - Pending count
  - Under review count
  - Overdue count (highlighted if > 0)

- **Filters**: Status dropdown

- **Table Columns**:
  - Transfer ID
  - Requirement (with filename + description)
  - Submitted By
  - Submitted At
  - SLA Due (calculated: upload date + 7 days)
  - Status (chip)
  - Actions (Review button)

#### My Reviews View
- **Table Columns**:
  - File Name (with description)
  - Requirement
  - Decision (status chip)
  - Review Comments (truncated)
  - Reviewed At
  - Actions (View Details button)

#### All Transfers View
- **Table Columns**:
  - Transfer Name (with escalation indicator if high priority)
  - Jurisdiction
  - Entity
  - Subject Type
  - Status (chip)
  - Priority (badge)
  - Created At
  - Requirements (count)

- **High Priority Rows**: Light red background (`#fff5f5`), warning emoji

#### Document Library View
- **Filters**: Document Status dropdown

- **Expandable Groups**:
  - Each document is a collapsible row
  - Header shows: filename, status badge, upload date
  - Expanded view shows: requirement ID, action buttons
  - Expand icon rotates 90deg when expanded

- **Pagination**: Previous/Next buttons, page indicator

#### Template Upload View
- **Header**: Title + "Upload Template" button
- **Table Columns**:
  - Template Name
  - File Type
  - Uploaded At
  - Actions (Delete button with trash icon)

---

### Business Dashboard

**Navigation Tabs:**
- Escalated Evidence
- Process Reviews (coming soon)
- Business Analytics (coming soon)

**Key Features:**

#### Escalated Evidence View
- **Stats Bar**: 4 cards
  - Total Escalations (with layers icon)
  - High Priority (alert icon, highlighted if > 0)
  - Medium Priority (clock icon)
  - Low Priority (check icon)

- **Priority Calculation**:
  - High: > 7 days old
  - Medium: 3-7 days old
  - Low: < 3 days old

- **Table Columns**:
  - Transfer ID
  - Requirement (filename + description)
  - Submitted By
  - Submitted At
  - Priority (badge)
  - Status (chip)
  - Actions (Review button)

- **Special Behavior**:
  - Auto-refreshes every 5 seconds
  - Filters evidence where `escalatedTo === 'Business'`
  - MER submissions open MER Review Panel

---

### Legal Review Dashboard

**Navigation Tabs:**
- Escalated Evidence
- Content Management
- Templates

**Key Features:**

#### Escalated Evidence View
- **Stats Bar**: 4 cards
  - Total Escalations (alert icon)
  - High Priority (double chevron up icon, highlighted)
  - Medium Priority (single chevron up icon)
  - Low Priority (minus icon)

- **Table Columns**:
  - Transfer ID
  - Requirement (filename + description with better line-height)
  - Submitted By
  - Submitted At
  - Priority (badge)
  - Status (chip)
  - Actions (Review button)

- **Special Behavior**:
  - Auto-refreshes every 5 seconds
  - Shows all escalated evidence regardless of target
  - MER submissions open MER Review Panel for Legal team

#### Content Management View
- Separate component: `LegalContentDashboard`

#### Templates View
- Separate component: `LegalTemplates`

---

### End User Dashboard

**Navigation Tabs:**
- My Transfers
- Requirements
- Uploaded Evidence

**Key Features:**

#### My Transfers View
- **Stats Bar** (in header): 4 cards
  - Total Transfers (layers icon)
  - Pending Review (clock icon)
  - Approved (check icon)
  - Escalated (alert icon, highlighted if > 0)

- **Table Columns**:
  - Transfer Name (with ID below in monospace)
  - Jurisdiction
  - Entity
  - Progress (approved/total count)
  - SLA Status (badge with days remaining/overdue)
  - Status (chip - calculated from requirements)
  - Actions (View, Details, Escalate buttons)

- **SLA Calculation**:
  - Based on oldest pending/under review requirement
  - Due date: upload date + 7 days
  - Breached: < 0 days (red, "Xd overdue")
  - Approaching: ≤ 2 days (orange, "Xd left")
  - OK: > 2 days (green, "On track")

- **Escalate Button**:
  - Only shown if SLA breached/approaching AND not already escalated AND not approved

#### Requirements View
- **Table Columns**:
  - Requirement (name + description)
  - Jurisdiction
  - Entity
  - Subject Type
  - Status (chip)
  - Last Updated
  - Actions (Upload button - disabled if approved, View button)

- **Empty State**: Shows message to select a transfer if none selected

#### Uploaded Evidence View
- **Table Columns**:
  - File Name (with description)
  - Entity (extracted from requirement ID)
  - Country (extracted from requirement ID)
  - File Size (formatted: Bytes/KB/MB/GB)
  - Upload Date
  - Status (chip)

---

## Interaction Patterns

### Navigation Flow
1. User clicks navigation tab
2. Active tab updates with visual highlight (border bottom, bold text)
3. Main content area smoothly transitions to corresponding view
4. Stats/filters update based on active view
5. URL updates to reflect current view (optional)

### Data Refresh
- **Admin Dashboard**: Manual refresh on view change
- **Business Dashboard**: Auto-refresh every 5 seconds
- **Legal Dashboard**: Auto-refresh every 5 seconds
- **End User Dashboard**: Auto-refresh every 30 seconds

### Modal/Drawer Patterns
- **Review Drawer**: Slides in from right, overlays content
- **Upload Modal**: Centered overlay with backdrop
- **Audit Trail Modal**: Centered overlay
- **MER Review Panel**: Full-screen or large overlay

### Expandable Rows
- Click header to toggle expansion
- Chevron/arrow icon rotates 90deg when expanded
- Smooth transition animation
- Expanded content has lighter background

---

## Responsive Considerations

### Breakpoints
- Desktop: Full layout with horizontal tabs
- Tablet: Scrollable tabs, adjusted stats grid
- Mobile: Dropdown menu or scrollable tabs for navigation

### Stats Grid
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

### Table Responsiveness
- Horizontal scroll on smaller screens
- Consider card view for mobile
- Sticky headers for long tables

---

## Accessibility Guidelines

### Color Contrast
- Ensure all text meets WCAG AA standards
- Status colors have sufficient contrast with white text

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Enter/Space to activate buttons
- Arrow keys for table navigation

### Screen Reader Support
- Proper ARIA labels for icons
- Status announcements for dynamic updates
- Table headers properly associated

### Focus States
- Visible focus indicators on all interactive elements
- Focus trap in modals/drawers

---

## Implementation Notes

### Component Reusability
All dashboards share these common components:
- `DashboardContainer`: Main layout wrapper
- `TabNavigation`: Horizontal tab navigation
- `DashboardStats`: Stats card grid
- `Table`, `Th`, `Td`, [Tr](file:///Users/divyampant/Documents/Projects/DCT_Cursor/dct-test-app/src/components/EndUserDashboard.tsx#240-326): Table components
- `StatusChip`: Status badges
- `PriorityBadge`: Priority indicators
- `SLABadge`: SLA status indicators
- `ActionButton`: Styled buttons
- `Filters`, `FilterGroup`: Filter controls
- `NoDataMessage`, `LoadingMessage`: Empty/loading states

### State Management
- Each dashboard manages its own state
- Common hooks: `useEvidenceApi` for data fetching
- Refresh patterns vary by dashboard (manual vs auto)

### Styling Approach
- Styled-components for component-specific styles
- Shared design tokens from `styles/designTokens`
- Consistent naming conventions

### Data Flow
1. Dashboard loads → Fetches data via API hooks
2. Data stored in local state
3. Filters applied client-side
4. User actions trigger API calls → Refresh data
5. Modals/drawers receive data as props

---

## Visual Hierarchy

### Information Priority
1. **Primary**: Stats cards, table primary columns (names, IDs)
2. **Secondary**: Status indicators, dates, counts
3. **Tertiary**: Descriptions, metadata, helper text

### Visual Weight
- **Bold**: Headers, primary text, active states
- **Medium**: Body text, labels
- **Light**: Secondary text, placeholders, disabled states

### Spacing Rhythm
- Tight: Within cards (0.25rem - 0.5rem)
- Medium: Between elements (0.75rem - 1rem)
- Loose: Between sections (1.5rem - 2rem)

---

## Key Design Principles

1. **Consistency**: All dashboards follow the same visual language
2. **Clarity**: Information hierarchy is clear and scannable
3. **Efficiency**: Common tasks require minimal clicks
4. **Feedback**: All actions provide immediate visual feedback
5. **Flexibility**: Modular architecture allows easy customization
6. **Scalability**: Design accommodates varying data volumes

---

## Summary

This specification provides a complete blueprint for implementing the Central Inventory dashboards. The design emphasizes:

- **Modular architecture** for code reusability
- **Consistent visual language** across all dashboards
- **Role-specific functionality** while maintaining common patterns
- **Clear information hierarchy** for efficient task completion
- **Responsive and accessible** design for all users

When implementing these dashboards, maintain the established patterns for components, colors, spacing, and interactions to ensure a cohesive user experience across the entire Central Inventory system.
