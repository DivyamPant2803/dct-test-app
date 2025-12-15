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

// Evidence Upload and Review Types
export type RequirementStatus = "PENDING" | "APPROVED" | "REJECTED" | "UNDER_REVIEW" | "ESCALATED";

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
}

export interface Transfer {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
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
}

export interface AuditEntry {
  id: string;
  requirementId: string;
  action: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  performedBy: string;
  performedAt: string;
  note?: string;
  previousStatus?: RequirementStatus;
  newStatus: RequirementStatus;
}

export interface ReviewDecision {
  evidenceId: string;
  decision: 'APPROVE' | 'REJECT' | 'ESCALATE';
  note?: string;
  escalationReason?: string;
  taggedAuthorities?: string[];
  escalatedTo?: string;
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