export interface Question {
  id: string;
  text: string;
  type: 'multiple';
  options: string[];
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

export interface AssessmentResult {
  id: string;
  informationCategory: string[];
  dataSubjectType: string[];
  countries: string[];
  entities: Record<string, string[]>;
  recipientType: string[];
  transferAllowed: boolean;
  restrictions: string[];
  complianceScore: number;
}

export interface QuestionnaireState {
  answers: Record<string, string[]>;
  currentStep: number;
}

export interface CountryEntity {
  country: string;
  entities: {
    category: string;
    names: string[];
  }[];
}

export const DATA_SUBJECT_TYPES = {
  PERSON: ['Employee', 'Candidate', 'C-Employee'],
  CLIENT: ['Employee', 'Candidate', 'C-Employee'],
} as const;

export const RECIPIENT_TYPES = ['Entity', 'Provider', 'Third Party', 'External'] as const;

// MER (Minimum Enterprise Requirement) Types
export type MERType = 'MER-13' | 'MER-14';

export interface MERTemplateField {
  id: string;
  label: string;
  value: string;
  editable: boolean;
  required: boolean;
  type: 'text' | 'textarea' | 'select' | 'date' | 'file';
  options?: string[]; // for select fields
  placeholder?: string;
  helpText?: string;
}

export interface MERTemplate {
  id: string;
  merType: MERType;
  version: string;
  fields: MERTemplateField[];
  createdAt: string;
  createdBy: string;
  description?: string;
}

// Reviewer Types for Role-Based Access Control
export type ReviewerType = 'Admin' | 'Legal' | 'Business' | 'Deputy-Legal' | 'Deputy-Business';

// Evidence Upload and Review Types
export type RequirementStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "UNDER_REVIEW"
  | "ESCALATED"
  | "CLARIFICATION_REQUIRED"
  | "EVIDENCE_REQUESTED";

export interface RequirementRow {
  id: string;
  name: string;
  jurisdiction: string;
  entity: string;
  subjectType: string;
  status: RequirementStatus;
  updatedAt: string;
  transferId: string;
  description?: string;
  dueDate?: string;
}

export interface Evidence {
  id: string;
  requirementId: string;
  filename: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  status: RequirementStatus;
  reviewerNote?: string;
  reviewerId?: string;
  reviewedAt?: string;
  fileType: 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX';
  description?: string;
  base64Data?: string; // For localStorage storage
  // New escalation fields
  escalatedTo?: string;
  escalatedBy?: string;
  escalatedAt?: string;
  escalationReason?: string;
  escalationHistory?: Array<{
    id: string;
    escalatedTo: string;
    escalatedBy: string;
    escalatedAt: string;
    reason: string;
    comments: string;
    taggedAuthorities: string[];
  }>;
  taggedAuthorities?: string[];
  // Deputy assignment fields
  assignedDeputy?: string;
  assignedDeputyType?: ReviewerType;
  deputyAssignedAt?: string;
  deputyAssignedBy?: string;
  // MER transfer reference (for virtual evidence entries)
  merTransferId?: string;
}

export interface Transfer {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'ESCALATED';
  jurisdiction: string;
  entity: string;
  subjectType: string;
  requirements: RequirementRow[];
  // Escalation fields
  escalatedTo?: string;
  escalatedBy?: string;
  escalatedAt?: string;
  isHighPriority?: boolean;
  escalationReason?: string;
  // MER template fields
  merType?: MERType;
  merTemplateId?: string;
  merTemplateData?: Record<string, any>; // field ID → value mapping (supports strings, objects, arrays)
  // Clarification request fields
  clarificationRequest?: {
    requestedBy: string;
    requestedAt: string;
    message: string;
    responseBy?: string;
    responseAt?: string;
    responseMessage?: string;
  };
  // Evidence request fields
  evidenceRequest?: {
    requestedBy: string;
    requestedAt: string;
    message: string;
    uploadedAt?: string;
  };
  // MER review data (for end-user visibility)
  reviewData?: MERReviewData;
}

export interface AuditEntry {
  id: string;
  requirementId: string; // Can be a requirement ID or transfer ID
  action:
  | 'CREATED'                    // Transfer request created
  | 'SUBMITTED'                  // Evidence submitted
  | 'REVIEWED'                   // Under review
  | 'APPROVED'                   // Approved by reviewer
  | 'REJECTED'                   // Rejected by reviewer
  | 'ESCALATED'                  // Escalated to higher authority
  | 'CLARIFICATION_REQUESTED'    // Clarification requested from user
  | 'CLARIFICATION_PROVIDED'     // User provided clarification
  | 'EVIDENCE_REQUESTED'         // Additional evidence requested
  | 'EVIDENCE_PROVIDED'          // Additional evidence uploaded
  | 'ASSIGNED'                   // Assigned to a reviewer
  | 'REASSIGNED';                // Reassigned to different reviewer
  performedBy: string;
  performedByRole?: 'END_USER' | 'ADMIN' | 'LEGAL' | 'SYSTEM';
  performedAt: string;
  note?: string;
  previousStatus?: RequirementStatus;
  newStatus: RequirementStatus;
  // Additional context for specific actions
  escalatedTo?: string;           // For ESCALATED action
  escalationReason?: string;      // For ESCALATED action
  assignedTo?: string;            // For ASSIGNED/REASSIGNED actions
  clarificationMessage?: string;  // For CLARIFICATION_REQUESTED action
  evidenceIds?: string[];         // For EVIDENCE_PROVIDED action
}

export interface ReviewDecision {
  evidenceId: string;
  decision: 'APPROVE' | 'REJECT' | 'ESCALATE';
  note?: string;
  escalationReason?: string;
  taggedAuthorities?: string[];
  escalatedTo?: string;
}

// MER Review Decision Types
export interface AttachmentReviewDecision {
  attachmentId: string; // Can be FileAttachment ID or Evidence ID
  attachmentType: 'template' | 'evidence'; // template = fileData, evidence = SimpleMERUpload
  decision: 'APPROVE' | 'REJECT';
  note?: string;
}

export interface MERReviewDecision {
  transferId: string;
  overallDecision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  adminComments: string;
  attachmentDecisions: AttachmentReviewDecision[];
  reviewedBy: string;
  reviewedAt: string;
}

export interface MERReviewData {
  overallDecision: 'APPROVED' | 'REJECTED' | 'PENDING' | 'UNDER_REVIEW';
  adminComments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  attachmentDecisions: {
    attachmentId: string;
    attachmentName: string;
    decision: 'APPROVED' | 'REJECTED' | 'PENDING';
    comments?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  }[];
}


export interface User {
  id: string;
  name: string;
  role: 'END_USER' | 'ADMIN' | 'LEGAL';
  email: string;
}

// Change Request System Types
export interface Requirement {
  id: string;
  version: number;
  title: string;
  jurisdiction: string;
  entity: string;
  subjectType: string;
  status?: string;
  text: string;
  updatedAt: string;
  effectiveDate: string;
  createdBy: string;
  lastModifiedBy: string;
  // Reaffirmation fields
  originalIngestionDate: string;
  lastReaffirmedAt?: string;
  lastReaffirmedBy?: string;
  reaffirmationHistory: ReaffirmationEntry[];
  nextReaffirmationDue: string;
  // Additional fields for comprehensive modal display
  contactPersons?: string[];
  recipientTypes?: string[];
  dataSubjectTypeDetails?: {
    type: string;
    transferLocation: string; // Inside/Outside country
    categoryOfData: string; // Personal/Sensitive/Private
    dataTransferPurpose: string;
  }[];
  output?: string; // OK/OKC/NOK
  remediation?: string;
}

export type CRStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ChangeRequest {
  id: string;
  requirementId: string;
  baseVersion: number;
  proposedText: string;
  impact: string;
  author: string;
  approver: string;
  status: CRStatus;
  createdAt: string;
  decidedAt?: string;
  reviewer?: string;
  reviewerNote?: string;
  title: string;
  jurisdiction: string;
  entity: string;
  subjectType: string;
}

export interface RequirementVersion {
  id: string;
  requirementId: string;
  version: number;
  text: string;
  author: string;
  date: string;
  changeRequestId?: string;
  effectiveDate: string;
}

// AI-powered Assistance Types
export interface AISummary {
  requirementId: string;
  version: number;
  summary: string;
  createdAt: string;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: string;
  contextRequirementId?: string;
}

export interface AIInsights {
  topAskedIntents: {
    intent: string;
    count: number;
  }[];
  requirementsNeedingHelp: {
    requirementId: string;
    title: string;
    helpClicks: number;
  }[];
  period: string;
}

// Reaffirmation System Types
export interface ReaffirmationEntry {
  id: string;
  requirementId: string;
  reaffirmedAt: string;
  reaffirmedBy: string;
  action: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
  comment?: string;
  changes?: string;
  previousVersion?: number;
  newVersion?: number;
}

export interface ReaffirmationRequest {
  requirementId: string;
  action: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
  comment?: string;
  proposedChanges?: string;
}

export type ReaffirmationStatus = 'CURRENT' | 'DUE_SOON' | 'OVERDUE';

// Enhanced Requirement Combination System
export interface RequirementCombination {
  id: string;
  entity: string;
  dataSubjectType: string;
  transferLocation: string;
  recipientType: string;
  reviewDataTransferPurpose: string;
  requirement: Requirement;
  reaffirmationStatus: ReaffirmationStatus;
  nextReaffirmationDue: string;
  lastReaffirmedAt?: string;
  lastReaffirmedBy?: string;
  // Additional fields for comprehensive modal display
  jurisdiction?: string;
  status?: string;
  contactPersons?: string[];
  categoryOfData?: string; // Personal/Sensitive/Private
  output?: string; // OK/OKC/NOK
  remediation?: string;
}

export interface EntityGroup {
  entity: string;
  combinations: RequirementCombination[];
  totalRequirements: number;
  dueRequirements: number;
  overdueRequirements: number;
}

export interface FilterCriteria {
  entities: string[];
  dataSubjectTypes: string[];
  transferLocations: string[];
  recipientTypes: string[];
  reviewDataTransferPurposes: string[];
  reaffirmationStatuses: ReaffirmationStatus[];
}

export interface BulkReaffirmationRequest {
  combinationIds: string[];
  action: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
  comment: string;
  remediation?: string;
  newRequirements?: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  individualOverrides?: Record<string, {
    action?: 'REAFFIRMED_AS_IS' | 'REAFFIRMED_WITH_CHANGES';
    comment?: string;
  }>;
}

export interface BulkOperationProgress {
  operationId: string;
  totalItems: number;
  processedItems: number;
  completedItems: number;
  failedItems: number;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  startTime: string;
  endTime?: string;
  errors?: string[];
}

// Legal Templates System Types
export interface DataSubjectTypeConfig {
  type: string;  // Client, Employee, Prospect, Candidate
  transferLocation: string[];  // Inside/Outside
  categoryOfData: string[];  // Personal, Sensitive
  purpose: string[];  // KYC, Compliance
  output: string[];  // OK, OKC, NOK
  conditions: string;
  remediations: string;
}

export interface LegalTemplate {
  id: string;
  version: string;
  jurisdiction: string;
  entityId: string;
  entityName: string;
  ingestedAt: string;
  ingestedBy: string;
  recipientType: string[];  // Entity, ServiceProvider, ThirdParty
  contactPerson: string;
  dataSubjectTypes: DataSubjectTypeConfig[];
}

export interface TemplateSelection {
  recipientType: string[];
  contactPerson: boolean;
  dataSubjectTypes: Record<string, {
    selected: boolean;
    transferLocation: string[];
    categoryOfData: string[];
    purpose: string[];
    output: string[];
    conditions: boolean;
    remediations: boolean;
  }>;
}

// Document Upload Types
export type DocumentType = 'PDF' | 'DOCX' | 'DOC';
export type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type TemplateType = 'PDF_FORM' | 'DYNAMIC_FORM'; // Type discriminator
export type ControlType = 'MER-13' | 'MER-14' | 'EUC' | 'CUSTOM'; // Template control classification

// Enhanced Field Types - includes new radio, radio-group, file types
export type FieldType =
  | 'text'           // Single line text input
  | 'textarea'       // Multi-line text input
  | 'number'         // Numeric input
  | 'date'           // Date picker
  | 'select'         // Dropdown single select
  | 'checkbox'       // Single checkbox (boolean)
  | 'radio'          // Yes/No or single binary choice
  | 'radio-group'    // Multiple choice (A/B/C style)
  | 'table'          // Dynamic table with columns
  | 'file'           // Single file upload
  | 'file-multiple'; // Multiple file uploads

// PDF Form Field Type (for backward compatibility)
export interface PDFFormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'select' | 'textarea';
  value: string;
  required?: boolean;
  options?: string[];
}

// Dynamic Form Template Types
export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  width?: string;
  options?: string[];
  required?: boolean;
  prefillSource?: string; // Optional prefill for table columns
}

export interface TableConfig {
  columns: TableColumn[];
  minRows: number;
  maxRows?: number;
  allowAddRows: boolean;
  allowDeleteRows: boolean;
}

// Conditional Logic - show/hide fields based on other field values
export interface FieldCondition {
  dependsOn: string;              // Field ID this depends on
  showWhen: string | string[];    // Show when dependsOn equals this value(s)
  requiredWhen?: string | string[]; // Make required when this condition met
}

// File Upload Configuration
export interface FileUploadConfig {
  accept: string[];      // Allowed file extensions: ['.pdf', '.doc', '.docx']
  maxSizeMB: number;     // Maximum file size in MB
  multiple: boolean;     // Allow multiple files
}

// File Attachment - represents an uploaded file
export interface FileAttachment {
  id: string;
  fieldId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  base64Data?: string;   // For localStorage storage
  url?: string;          // For backend storage
}

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  options?: string[];           // For select, radio-group fields
  tableConfig?: TableConfig;    // For table fields
  order: number;
  helpText?: string;
  width?: 'full' | 'half' | 'third'; // Layout width

  // Prefill Configuration - ALL fields support prefill + editing
  prefillSource?: string;       // e.g., 'swcId', 'swcName', 'owner', 'dataClassification'
  prefillEditable?: boolean;    // Default true - user can always edit prefilled values

  // Conditional Logic
  condition?: FieldCondition;   // Show/hide based on other field values

  // File Upload Configuration
  fileConfig?: FileUploadConfig; // For 'file' and 'file-multiple' types
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  order: number;
  collapsible?: boolean;        // Allow section to be collapsed
  defaultCollapsed?: boolean;   // Start collapsed
}

// Unified UploadedTemplate with type discriminator
export interface UploadedTemplate {
  id: string;
  name: string;
  description?: string;
  status: TemplateStatus;
  templateType: TemplateType; // Discriminator: 'PDF_FORM' or 'DYNAMIC_FORM'

  // Template Classification
  controlType?: ControlType;    // MER-13, MER-14, EUC, etc.
  version?: string;             // Semantic version: '1.0.0'
  previousVersionId?: string;   // Link to previous version for history

  // File metadata
  originalFileName: string;
  fileSize: number;
  documentType: DocumentType;
  pdfBase64: string; // Base64 encoded PDF (for preview or PDF-based templates)

  // PDF-based template data (when templateType === 'PDF_FORM')
  hasFormFields?: boolean;
  formFields?: PDFFormField[];

  // Dynamic form template data (when templateType === 'DYNAMIC_FORM')
  sections?: TemplateSection[];

  // Field mapping for API prefilling (works for both types)
  // Maps field IDs to ApplicationData property names
  // Example: { 'swc_id': 'swcId', 'swc_name': 'swcName', 'manager': 'swcManager' }
  fieldMappings?: Record<string, string>;

  // Data Source Configuration (optional - for advanced prefill control)
  dataSources?: DataSourceConfig[];

  // Tracking
  uploadedBy: string;
  uploadedAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

// Data Source Configuration for prefill orchestration
export interface DataSourceConfig {
  sourceId: string;           // 'cmdb' | 'iam' | 'data-catalog' | 'compliance-registry'
  priority: number;           // Higher = more authoritative (used for conflict resolution)
  required: boolean;          // Fail if this source is unreachable?
  timeout: number;            // API timeout in ms
  fieldsProvided: string[];   // Which fields this source can populate
}

// Prefilled Form Data - result of prefill engine
export interface PrefilledFormData {
  fieldValues: Record<string, any>;           // fieldId -> prefilled value
  tableData: Record<string, any[]>;           // fieldId -> array of row objects
  fileAttachments: Record<string, FileAttachment[]>; // fieldId -> uploaded files
  sourceMetadata: Record<string, {            // fieldId -> metadata
    source: string;
    fetchedAt: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  missingFields: string[];                    // Fields that couldn't be prefilled
  errors: { field: string; error: string }[]; // Errors during prefill
}