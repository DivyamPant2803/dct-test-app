import { PersonaDashboardConfig, AuthorityConfig } from '../types/persona';

// Authority configurations for tagging
export const AUTHORITY_CONFIGS: Record<string, AuthorityConfig> = {
  Legal: {
    name: 'Legal',
    color: '#9C27B0',
    description: 'Compliance & Risk Management'
  },
  Business: {
    name: 'Business',
    color: '#2196F3',
    description: 'Process & Operations'
  },
  DISO: {
    name: 'DISO',
    color: '#F44336',
    description: 'Security & Technical'
  },
  Finance: {
    name: 'Finance',
    color: '#FF9800',
    description: 'Budget & Financial Review'
  },
  Privacy: {
    name: 'Privacy',
    color: '#4CAF50',
    description: 'Data Protection & Privacy'
  }
};

// Persona dashboard configurations
export const PERSONA_DASHBOARD_CONFIGS: Record<string, PersonaDashboardConfig> = {
  user: {
    name: 'End User',
    color: '#4CAF50',
    defaultTab: 'my-transfers',
    tabs: [
      { id: 'my-transfers', label: 'My Transfers', component: 'TransfersList' },
      { id: 'guidance', label: 'Guidance', component: 'GuidanceContent' }
    ],
    sections: [
      { id: 'stats', component: 'UserStats' },
      { id: 'recent-activity', component: 'RecentActivity' }
    ],
    filters: [
      { id: 'status', type: 'select', label: 'Status', options: ['All', 'Pending', 'Approved', 'Rejected'] },
      { id: 'date-range', type: 'date-range', label: 'Date Range' }
    ],
    actions: [
      { id: 'create-transfer', label: 'Create Transfer', variant: 'primary' }
    ],
    escalationTargets: []
  },

  admin: {
    name: 'Administrator',
    color: '#FF9800',
    defaultTab: 'evidence-queue',
    tabs: [
      { id: 'evidence-queue', label: 'Evidence Queue', component: 'EvidenceQueue' },
      { id: 'my-reviews', label: 'My Reviews', component: 'MyReviews' },
      { id: 'all-transfers', label: 'All Transfers', component: 'AllTransfers' },
      { id: 'ai-insights', label: 'AI Insights', component: 'AIInsights' }
    ],
    sections: [
      { id: 'stats', component: 'AdminStats' },
      { id: 'recent-activity', component: 'AdminActivity' }
    ],
    filters: [
      { id: 'status', type: 'select', label: 'Status', options: ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Escalated'] },
      { id: 'jurisdiction', type: 'select', label: 'Jurisdiction', options: ['All', 'US', 'EU', 'UK', 'Singapore'] },
      { id: 'entity', type: 'select', label: 'Entity', options: ['All', 'Entity A', 'Entity B'] }
    ],
    actions: [
      { id: 'bulk-approve', label: 'Bulk Approve', variant: 'secondary' },
      { id: 'export-data', label: 'Export Data', variant: 'secondary' }
    ],
    escalationTargets: ['Legal', 'Business', 'DISO', 'Finance', 'Privacy']
  },

  legal: {
    name: 'Legal Review',
    color: '#9C27B0',
    defaultTab: 'escalated-to-legal',
    tabs: [
      { id: 'escalated-to-legal', label: 'Escalated Evidence for Legal Review', component: 'EscalatedEvidence' },
      { id: 'my-reviews', label: 'My Reviews', component: 'LegalReviews' },
      { id: 'escalation-history', label: 'Escalation History', component: 'EscalationHistory' },
      { id: 'legal-analytics', label: 'Legal Analytics', component: 'LegalAnalytics' }
    ],
    sections: [
      { id: 'stats', component: 'LegalStats' },
      { id: 'priority-queue', component: 'PriorityQueue' }
    ],
    filters: [
      { id: 'priority', type: 'select', label: 'Priority', options: ['All', 'High', 'Medium', 'Low'] },
      { id: 'escalation-source', type: 'select', label: 'Escalation Source', options: ['All', 'Admin', 'Business', 'DISO', 'Finance', 'Privacy'] },
      { id: 'review-type', type: 'select', label: 'Review Type', options: ['All', 'Compliance', 'Contract', 'Risk'] }
    ],
    actions: [
      { id: 'escalate-to-business', label: 'Escalate to Business', variant: 'escalate' },
      { id: 'escalate-to-diso', label: 'Escalate to DISO', variant: 'escalate' },
      { id: 'escalate-to-finance', label: 'Escalate to Finance', variant: 'escalate' },
      { id: 'escalate-to-privacy', label: 'Escalate to Privacy', variant: 'escalate' }
    ],
    escalationTargets: ['Business', 'DISO', 'Finance', 'Privacy']
  },

  business: {
    name: 'Business Review',
    color: '#2196F3', // No icon for Business dashboard
    defaultTab: 'escalated-to-business',
    tabs: [
      { id: 'escalated-to-business', label: 'Escalated Evidence for Business Review', component: 'BusinessEvidence' },
      { id: 'process-reviews', label: 'Process Reviews', component: 'ProcessReviews' },
      { id: 'business-analytics', label: 'Business Analytics', component: 'BusinessAnalytics' }
    ],
    sections: [
      { id: 'stats', component: 'BusinessStats' },
      
    ],
    filters: [
      { id: 'process-type', type: 'select', label: 'Process Type', options: ['All', 'Approval', 'Compliance', 'Risk'] },
      { id: 'business-impact', type: 'select', label: 'Business Impact', options: ['All', 'High', 'Medium', 'Low'] },
      { id: 'department', type: 'select', label: 'Department', options: ['All', 'Sales', 'Marketing', 'Operations'] }
    ],
    actions: [
      { id: 'approve-process', label: 'Approve Process', variant: 'primary' },
      { id: 'escalate-to-legal', label: 'Escalate to Legal', variant: 'escalate' },
      { id: 'escalate-to-diso', label: 'Escalate to DISO', variant: 'escalate' }
    ],
    escalationTargets: ['Legal', 'DISO']
  },

  diso: {
    name: 'DISO',
    color: '#F44336', // No icon for DISO dashboard
    defaultTab: 'escalated-to-diso',
    tabs: [
      { id: 'escalated-to-diso', label: 'Escalated Evidence for DISO Review', component: 'DISOEvidence' },
      { id: 'security-reviews', label: 'Security Reviews', component: 'SecurityReviews' },
      { id: 'risk-assessments', label: 'Risk Assessments', component: 'RiskAssessments' },
      { id: 'security-analytics', label: 'Security Analytics', component: 'SecurityAnalytics' }
    ],
    sections: [
      { id: 'stats', component: 'DISOStats' },
      { id: 'security-alerts', component: 'SecurityAlerts' }
    ],
    filters: [
      { id: 'security-level', type: 'select', label: 'Security Level', options: ['All', 'Critical', 'High', 'Medium', 'Low'] },
      { id: 'technical-complexity', type: 'select', label: 'Technical Complexity', options: ['All', 'High', 'Medium', 'Low'] },
      { id: 'infrastructure', type: 'select', label: 'Infrastructure', options: ['All', 'Cloud', 'On-premise', 'Hybrid'] }
    ],
    actions: [
      { id: 'security-approve', label: 'Security Approve', variant: 'primary' },
      { id: 'escalate-to-legal', label: 'Escalate to Legal', variant: 'escalate' },
      { id: 'escalate-to-business', label: 'Escalate to Business', variant: 'escalate' }
    ],
    escalationTargets: ['Legal', 'Business']
  },

  finance: {
    name: 'Finance',
    color: '#4CAF50',
    defaultTab: 'escalated-to-finance',
    tabs: [
      { id: 'escalated-to-finance', label: 'Escalated to Finance', component: 'FinanceEvidence' },
      { id: 'budget-reviews', label: 'Budget Reviews', component: 'BudgetReviews' },
      { id: 'contract-analysis', label: 'Contract Analysis', component: 'ContractAnalysis' },
      { id: 'financial-analytics', label: 'Financial Analytics', component: 'FinancialAnalytics' }
    ],
    sections: [
      { id: 'stats', component: 'FinanceStats' },
      { id: 'budget-metrics', component: 'BudgetMetrics' }
    ],
    filters: [
      { id: 'budget-impact', type: 'select', label: 'Budget Impact', options: ['All', 'High', 'Medium', 'Low'] },
      { id: 'contract-type', type: 'select', label: 'Contract Type', options: ['All', 'Service', 'License', 'Purchase'] },
      { id: 'cost-center', type: 'select', label: 'Cost Center', options: ['All', 'IT', 'Operations', 'Legal'] }
    ],
    actions: [
      { id: 'budget-approve', label: 'Budget Approve', variant: 'primary' },
      { id: 'escalate-to-legal', label: 'Escalate to Legal', variant: 'escalate' },
      { id: 'escalate-to-business', label: 'Escalate to Business', variant: 'escalate' }
    ],
    escalationTargets: ['Legal', 'Business']
  },

  privacy: {
    name: 'Privacy',
    color: '#673AB7',
    defaultTab: 'escalated-to-privacy',
    tabs: [
      { id: 'escalated-to-privacy', label: 'Escalated to Privacy', component: 'PrivacyEvidence' },
      { id: 'data-protection', label: 'Data Protection Reviews', component: 'DataProtectionReviews' },
      { id: 'consent-management', label: 'Consent Management', component: 'ConsentManagement' },
      { id: 'privacy-analytics', label: 'Privacy Analytics', component: 'PrivacyAnalytics' }
    ],
    sections: [
      { id: 'stats', component: 'PrivacyStats' },
      { id: 'privacy-alerts', component: 'PrivacyAlerts' }
    ],
    filters: [
      { id: 'data-sensitivity', type: 'select', label: 'Data Sensitivity', options: ['All', 'Critical', 'High', 'Medium', 'Low'] },
      { id: 'privacy-impact', type: 'select', label: 'Privacy Impact', options: ['All', 'High', 'Medium', 'Low'] },
      { id: 'jurisdiction', type: 'select', label: 'Jurisdiction', options: ['All', 'GDPR', 'CCPA', 'PIPEDA'] }
    ],
    actions: [
      { id: 'privacy-approve', label: 'Privacy Approve', variant: 'primary' },
      { id: 'escalate-to-legal', label: 'Escalate to Legal', variant: 'escalate' },
      { id: 'escalate-to-business', label: 'Escalate to Business', variant: 'escalate' }
    ],
    escalationTargets: ['Legal', 'Business']
  }
};

// Get persona-specific navigation items
export const getPersonaNavigation = (persona: string) => {
  const baseItems = [
    { name: 'Home', route: '/' },
    { name: 'Guidance', route: '/guidance' },
    { name: 'Central Inventory', route: '/central-inventory' }
  ];

  switch (persona) {
    case 'user':
      return [
        ...baseItems,
        { name: 'My Transfers', route: '/my-transfers' }
      ];
    case 'admin':
      return [
        ...baseItems,
        { name: 'Administration', route: '/dct' },
      ];
    case 'legal':
      return [
        ...baseItems,
        { name: 'Legal', route: '/legal' },
      ];
    case 'business':
      return [
        ...baseItems,
        { name: 'Business', route: '/business' }
      ];
    case 'diso':
      return [
        ...baseItems,
        { name: 'DISO', route: '/diso' }
      ];
    case 'finance':
      return [
        ...baseItems,
        { name: 'Finance', route: '/finance' }
      ];
    case 'privacy':
      return [
        ...baseItems,
        { name: 'Privacy', route: '/privacy' }
      ];
    default:
      return baseItems;
  }
};
