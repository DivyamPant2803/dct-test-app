import { LegalTemplate } from '../types/index';

// Mock template data
const mockTemplates: LegalTemplate[] = [
  {
    id: 'template-1',
    version: 'v1.0',
    jurisdiction: 'Germany',
    entityId: 'DT-001',
    entityName: 'Deutsche Technologie und Datendienste GmbH',
    ingestedAt: '2024-01-15T10:30:00Z',
    ingestedBy: 'legal.team@deutsche-tech.com',
    recipientType: ['Entity', 'ServiceProvider'],
    contactPerson: 'Dr. Anna Mueller (anna.mueller@deutsche-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Inside Country', 'Outside Country'],
        categoryOfData: ['Personal', 'Sensitive'],
        purpose: ['KYC', 'Compliance'],
        output: ['OK', 'OKC'],
        conditions: 'Must comply with GDPR Article 6(1)(a) - consent, and Article 6(1)(f) - legitimate interests. Data retention period: 7 years for KYC, 3 years for marketing.',
        remediations: 'Implement data encryption at rest and in transit. Regular security audits every 6 months. Data subject access request handling procedures.'
      },
      {
        type: 'Employee',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Compliance'],
        output: ['OK'],
        conditions: 'HR data processing under GDPR Article 6(1)(b) - employment contract. Regular training on data protection.',
        remediations: 'Employee data protection training program. Annual privacy impact assessments.'
      }
    ]
  },
  {
    id: 'template-2',
    version: 'v2.0',
    jurisdiction: 'Germany',
    entityId: 'DT-001',
    entityName: 'Deutsche Technologie und Datendienste GmbH',
    ingestedAt: '2024-03-20T14:15:00Z',
    ingestedBy: 'legal.team@deutsche-tech.com',
    recipientType: ['Entity', 'ThirdParty'],
    contactPerson: 'Dr. Anna Mueller (anna.mueller@deutsche-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Outside Country'],
        categoryOfData: ['Sensitive'],
        purpose: ['KYC'],
        output: ['OKC'],
        conditions: 'Enhanced due diligence required for cross-border transfers. Standard Contractual Clauses (SCCs) implementation.',
        remediations: 'Third-party vendor assessment framework. Regular compliance monitoring.'
      },
      {
        type: 'Prospect',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Marketing'],
        output: ['OK'],
        conditions: 'Marketing consent under GDPR Article 6(1)(a). Opt-out mechanism required.',
        remediations: 'Marketing preference center. Consent management platform integration.'
      }
    ]
  },
  {
    id: 'template-3',
    version: 'v1.0',
    jurisdiction: 'United States',
    entityId: 'USG-001',
    entityName: 'US Global Technology Solutions Corporation',
    ingestedAt: '2024-02-10T09:45:00Z',
    ingestedBy: 'compliance@usglobal-tech.com',
    recipientType: ['Entity', 'ServiceProvider'],
    contactPerson: 'Sarah Johnson (sarah.johnson@usglobal-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Inside Country', 'Outside Country'],
        categoryOfData: ['Personal', 'Sensitive'],
        purpose: ['KYC', 'Compliance'],
        output: ['OK', 'OKC'],
        conditions: 'CCPA compliance required. Data minimization principles. Regular privacy assessments.',
        remediations: 'Privacy by design implementation. Data mapping and inventory procedures.'
      },
      {
        type: 'Employee',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Compliance'],
        output: ['OK'],
        conditions: 'Employment law compliance. Background check procedures.',
        remediations: 'Employee handbook updates. HR compliance training.'
      },
      {
        type: 'Candidate',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Compliance'],
        output: ['OK'],
        conditions: 'Recruitment data processing. Equal opportunity compliance.',
        remediations: 'Candidate data retention policy. Interview process documentation.'
      }
    ]
  },
  {
    id: 'template-4',
    version: 'v1.0',
    jurisdiction: 'Singapore',
    entityId: 'SAT-001',
    entityName: 'Singapore Advanced Technology Solutions Pte Ltd',
    ingestedAt: '2024-01-25T16:20:00Z',
    ingestedBy: 'legal@singapore-tech.com',
    recipientType: ['Entity'],
    contactPerson: 'Michael Chen (michael.chen@singapore-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Inside Country', 'Outside Country'],
        categoryOfData: ['Personal', 'Sensitive'],
        purpose: ['KYC', 'Compliance'],
        output: ['OK', 'OKC'],
        conditions: 'PDPA compliance required. Cross-border transfer restrictions. Data localization requirements.',
        remediations: 'Data Protection Officer appointment. Regular PDPA training programs.'
      },
      {
        type: 'Employee',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Compliance'],
        output: ['OK'],
        conditions: 'Employment Act compliance. Workplace safety requirements.',
        remediations: 'Employee data protection policies. Regular compliance audits.'
      }
    ]
  },
  {
    id: 'template-5',
    version: 'v1.1',
    jurisdiction: 'Singapore',
    entityId: 'SAT-001',
    entityName: 'Singapore Advanced Technology Solutions Pte Ltd',
    ingestedAt: '2024-04-05T11:30:00Z',
    ingestedBy: 'legal@singapore-tech.com',
    recipientType: ['Entity', 'ServiceProvider'],
    contactPerson: 'Michael Chen (michael.chen@singapore-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Outside Country'],
        categoryOfData: ['Sensitive'],
        purpose: ['KYC'],
        output: ['OKC'],
        conditions: 'Enhanced due diligence for high-risk transfers. Regulatory approval requirements.',
        remediations: 'Risk assessment framework. Third-party monitoring procedures.'
      },
      {
        type: 'Prospect',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Marketing'],
        output: ['OK'],
        conditions: 'Marketing consent management. Preference center implementation.',
        remediations: 'Customer preference management system. Marketing automation compliance.'
      }
    ]
  },
  {
    id: 'template-6',
    version: 'v1.2',
    jurisdiction: 'Singapore',
    entityId: 'SAT-001',
    entityName: 'Singapore Advanced Technology Solutions Pte Ltd',
    ingestedAt: '2024-06-15T13:45:00Z',
    ingestedBy: 'legal@singapore-tech.com',
    recipientType: ['Entity', 'ThirdParty'],
    contactPerson: 'Michael Chen (michael.chen@singapore-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Compliance'],
        output: ['OK'],
        conditions: 'Standard compliance requirements. Regular review cycles.',
        remediations: 'Compliance monitoring dashboard. Automated reporting systems.'
      }
    ]
  }
];

// Mock API functions
export const getTemplates = async (filters?: {
  jurisdiction?: string;
  entityId?: string;
  entityName?: string;
}): Promise<LegalTemplate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filteredTemplates = [...mockTemplates];

  if (filters?.jurisdiction) {
    filteredTemplates = filteredTemplates.filter(t => t.jurisdiction === filters.jurisdiction);
  }

  if (filters?.entityId) {
    filteredTemplates = filteredTemplates.filter(t => t.entityId === filters.entityId);
  }

  if (filters?.entityName) {
    filteredTemplates = filteredTemplates.filter(t => t.entityName === filters.entityName);
  }

  return filteredTemplates;
};

export const getTemplateById = async (id: string): Promise<LegalTemplate | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const template = mockTemplates.find(t => t.id === id);
  return template || null;
};

export const getJurisdictions = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const jurisdictions = [...new Set(mockTemplates.map(t => t.jurisdiction))];
  return jurisdictions.sort();
};

export const getEntityNames = async (jurisdiction?: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  let templates = mockTemplates;
  if (jurisdiction) {
    templates = templates.filter(t => t.jurisdiction === jurisdiction);
  }

  const entityNames = [...new Set(templates.map(t => t.entityName))];
  return entityNames.sort();
};

export const getEntityIds = async (jurisdiction?: string, entityName?: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  let templates = mockTemplates;
  if (jurisdiction) {
    templates = templates.filter(t => t.jurisdiction === jurisdiction);
  }
  if (entityName) {
    templates = templates.filter(t => t.entityName === entityName);
  }

  const entityIds = [...new Set(templates.map(t => t.entityId))];
  return entityIds.sort();
};


