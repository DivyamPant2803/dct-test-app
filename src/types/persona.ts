// Persona Types for the DCT Application
export type PersonaType = 'user' | 'admin' | 'legal' | 'business' | 'diso' | 'finance' | 'privacy';

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface TabConfig {
  id: string;
  label: string;
  component: string;
  route?: string;
}

export interface SectionConfig {
  id: string;
  component: string;
  props?: Record<string, any>;
}

export interface FilterConfig {
  id: string;
  type: 'select' | 'date-range' | 'text';
  label: string;
  options?: string[];
  placeholder?: string;
}

export interface ActionConfig {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'escalate' | 'danger';
  icon?: string;
}

export interface PersonaDashboardConfig {
  name: string;
  icon?: string;
  color: string;
  defaultTab: string;
  tabs: TabConfig[];
  sections: SectionConfig[];
  filters: FilterConfig[];
  actions: ActionConfig[];
  escalationTargets: string[];
}

// Enhanced Evidence type with escalation tracking
export interface EscalationEvent {
  id: string;
  escalatedTo: string;
  escalatedBy: string;
  escalatedAt: string;
  reason: string;
  comments: string;
  taggedAuthorities: string[];
}

// Extended Evidence interface
export interface EnhancedEvidence {
  id: string;
  requirementId: string;
  filename: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  reviewerNote?: string;
  reviewerId?: string;
  reviewedAt?: string;
  fileType: 'PDF' | 'DOC' | 'DOCX' | 'XLS' | 'XLSX';
  description?: string;
  base64Data?: string;
  // New escalation fields
  escalatedTo?: string;
  escalatedBy?: string;
  escalatedAt?: string;
  escalationReason?: string;
  escalationHistory?: EscalationEvent[];
  taggedAuthorities?: string[];
}

// Authority types for tagging
export type AuthorityType = 'Legal' | 'Business' | 'DISO' | 'Finance' | 'Privacy';

export interface AuthorityConfig {
  name: AuthorityType;
  color: string;
  icon?: string;
  description: string;
}
