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
    recipientType: ['Entity', 'Service Provider', 'Third Party', 'External Authorities'],
    contactPerson: 'Dr. Anna Mueller (anna.mueller@deutsche-tech.com)',
    dataSubjectTypes: [
      {
        type: 'Client',
        transferLocation: ['Inside Country', 'Outside Country'],
        categoryOfData: ['Personal', 'Sensitive'],
        purpose: ['Client Relationship Management', 'KYC/AML', 'Compliance with legal or regulatory obligations', 'Facilitation of Outsourcing/Nearshoring/Offshoring (ONO)'],
        output: ['OK', 'OKC', 'NOK'],
        conditions: 'This comprehensive data processing framework encompasses multiple legal bases under GDPR Article 6, including consent (Article 6(1)(a)), contract performance (Article 6(1)(b)), legal obligation (Article 6(1)(c)), vital interests (Article 6(1)(d)), public task (Article 6(1)(e)), and legitimate interests (Article 6(1)(f)). All data processing activities must comply with the principle of data minimization (Article 5(1)(c)), ensuring that only necessary and relevant personal data is collected and processed. Cross-border transfers require appropriate safeguards including Standard Contractual Clauses (SCCs), Binding Corporate Rules (BCRs), or adequacy decisions by the European Commission. Data subjects have comprehensive rights including access (Article 15), rectification (Article 16), erasure (Article 17), restriction of processing (Article 18), data portability (Article 20), and objection (Article 21). All processing activities must be documented and subject to regular Data Protection Impact Assessments (DPIAs) as required under Article 35. Data retention periods must be clearly defined and regularly reviewed, with automatic deletion mechanisms implemented where technically feasible. Third-party processors must be subject to data processing agreements containing all mandatory clauses under Article 28. Regular training programs must be conducted for all staff handling personal data, with annual refresher courses and incident response procedures clearly documented and tested.',
        remediations: 'Implement comprehensive data governance framework including Data Protection Officer (DPO) appointment with direct reporting line to senior management and board of directors. Establish cross-functional privacy committee with representatives from legal, IT, HR, marketing, and business operations to ensure privacy by design principles are embedded throughout all business processes. Deploy automated data discovery and classification tools to identify and catalog all personal data across the organization, including structured and unstructured data repositories, cloud services, and third-party systems. Implement privacy-preserving technologies including differential privacy, homomorphic encryption, and secure multi-party computation where appropriate. Establish comprehensive vendor management program with mandatory privacy assessments for all third-party processors, including on-site audits and continuous monitoring capabilities. Deploy advanced threat detection and response systems with 24/7 security operations center (SOC) monitoring, automated incident response playbooks, and regular penetration testing by certified ethical hackers. Implement comprehensive data loss prevention (DLP) solutions across all endpoints, networks, and cloud environments with real-time monitoring and automated response capabilities. Establish regular compliance monitoring and reporting mechanisms with quarterly privacy impact assessments, annual compliance audits by independent third parties, and monthly privacy metrics dashboards for senior management. Deploy advanced analytics and machine learning capabilities for privacy risk assessment, automated compliance checking, and predictive privacy impact analysis. Implement comprehensive staff training programs including role-based privacy training modules, regular phishing simulations, and mandatory privacy awareness certification for all employees handling personal data.'
      },
      {
        type: 'Prospect',
        transferLocation: ['Inside Country'],
        categoryOfData: ['Personal'],
        purpose: ['Marketing', 'Client Relationship Management'],
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


