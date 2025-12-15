import { RequirementCombination, ReaffirmationStatus } from '../types/index';
import { EntitySummary } from '../types/requirements';

// Sample entity names (300 entities)
const ENTITY_NAMES = [
  'Deutsche Technologie und Datendienste GmbH',
  'US Global Technology Solutions Corporation',
  'Singapore Advanced Technology Solutions Pte Ltd',
  'UK Digital Innovation Limited',
  'France Data Systems SA',
  'Canada Tech Services Inc',
  'Brazil Information Solutions Ltda',
  'Japan Technology Partners KK',
  'Australia Data Management Pty Ltd',
  'Netherlands Digital Solutions BV',
  // Add more entity names as needed...
];

const DATA_SUBJECT_TYPES = ['Employee', 'Client', 'Candidate', 'Prospect'];
const TRANSFER_LOCATIONS = ['Germany', 'United States', 'Singapore', 'United Kingdom', 'Canada', 'Brazil', 'France', 'Japan', 'Australia', 'Netherlands'];
const RECIPIENT_TYPES = ['Entity', 'Service Provider', 'Third Party', 'External Authorities'];
const REVIEW_DATA_TRANSFER_PURPOSES = [
  'Client Relationship Management',
  'Administration of Employment Contract',
  'Monitoring',
  'Compliance with Legal or Regulatory Obligations',
  'Other Purposes'
];

// Generate entity names (300 total)
export const generateEntityNames = (): string[] => {
  const entities: string[] = [];
  const baseNames = ENTITY_NAMES;

  // Use base names and create variations
  for (let i = 0; i < 300; i++) {
    const baseName = baseNames[i % baseNames.length];
    const suffix = Math.floor(i / baseNames.length);
    entities.push(suffix > 0 ? `${baseName} ${suffix + 1}` : baseName);
  }

  return entities;
};

// Generate mock requirement combinations for a specific jurisdiction
export const generateMockCombinations = (
  entityName: string,
  count: number,
  jurisdiction?: string
): RequirementCombination[] => {
  const combinations: RequirementCombination[] = [];

  const CONTACT_PERSONS = [
    'Dr. Anna Mueller (anna.mueller@deutsche-tech.com)',
    'Sarah Johnson (sarah.johnson@usglobal-tech.com)',
    'Michael Chen (michael.chen@singapore-tech.com)',
    'Emma Williams (emma.williams@uk-digital.com)',
    'Pierre Dubois (pierre.dubois@france-data.com)'
  ];

  const CATEGORIES_OF_DATA = ['Personal', 'Sensitive', 'Private'];
  const OUTPUTS = ['OK', 'OKC', 'NOK'];
  const REMEDIATIONS = [
    'Ensure proper consent is obtained before data transfer',
    'Implement additional security measures for sensitive data',
    'Review and update data processing agreements',
    'Conduct regular compliance audits'
  ];

  // Use provided jurisdiction or pick one randomly for all combinations in this version
  const versionJurisdiction = jurisdiction || TRANSFER_LOCATIONS[Math.floor(Math.random() * TRANSFER_LOCATIONS.length)];

  // Determine regulation type based on jurisdiction
  const getRegulationType = (jurisdiction: string): string => {
    if (jurisdiction === 'Germany' || jurisdiction === 'France' || jurisdiction === 'Netherlands') return 'GDPR';
    if (jurisdiction === 'United States') return 'CCPA';
    if (jurisdiction === 'Canada') return 'PIPEDA';
    if (jurisdiction === 'Brazil') return 'LGPD';
    if (jurisdiction === 'Singapore') return 'PDPA';
    if (jurisdiction === 'Japan') return 'APPI';
    if (jurisdiction === 'Australia') return 'Privacy Act';
    if (jurisdiction === 'United Kingdom') return 'UK GDPR';
    return 'PDPA';
  };

  const regulationType = getRegulationType(versionJurisdiction);

  for (let i = 0; i < count; i++) {
    const status: ReaffirmationStatus = Math.random() < 0.6 ? 'CURRENT' : Math.random() < 0.7 ? 'DUE_SOON' : 'OVERDUE';
    const dataSubjectType = DATA_SUBJECT_TYPES[Math.floor(Math.random() * DATA_SUBJECT_TYPES.length)];
    // Use the version's jurisdiction as the transfer location
    const transferLocation = versionJurisdiction;
    const categoryOfData = CATEGORIES_OF_DATA[Math.floor(Math.random() * CATEGORIES_OF_DATA.length)];
    const recipientType = RECIPIENT_TYPES[Math.floor(Math.random() * RECIPIENT_TYPES.length)];
    const purpose = REVIEW_DATA_TRANSFER_PURPOSES[Math.floor(Math.random() * REVIEW_DATA_TRANSFER_PURPOSES.length)];

    // Generate 1-3 contact persons
    const numContacts = Math.floor(Math.random() * 3) + 1;
    const contactPersons = Array.from({ length: numContacts }, () =>
      CONTACT_PERSONS[Math.floor(Math.random() * CONTACT_PERSONS.length)]
    );

    // Generate 1-2 recipient types
    const numRecipients = Math.floor(Math.random() * 2) + 1;
    const recipientTypes = Array.from({ length: numRecipients }, () =>
      RECIPIENT_TYPES[Math.floor(Math.random() * RECIPIENT_TYPES.length)]
    );

    // Create a descriptive title based on the combination attributes
    const combinationTitle = `${regulationType} - ${dataSubjectType} - ${recipientType} - ${purpose}`;

    combinations.push({
      id: `combo-${entityName.replace(/\s+/g, '-').toLowerCase()}-${versionJurisdiction.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      entity: entityName,
      dataSubjectType,
      transferLocation,
      recipientType,
      reviewDataTransferPurpose: purpose,
      requirement: {
        id: `req-${versionJurisdiction.replace(/\s+/g, '-').toLowerCase()}-${i}`,
        version: 1,
        title: combinationTitle,
        jurisdiction: versionJurisdiction, // Same jurisdiction for all combinations in this version
        entity: entityName,
        subjectType: dataSubjectType,
        status: status === 'CURRENT' ? 'Active' : status === 'DUE_SOON' ? 'Review Required' : 'Overdue',
        text: `${regulationType} compliance requirement for ${dataSubjectType.toLowerCase()} data subjects. This governs ${purpose.toLowerCase()} with ${recipientType.toLowerCase()} recipients. Data category: ${categoryOfData}.`,
        updatedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        createdBy: 'admin-user',
        lastModifiedBy: 'legal-user',
        originalIngestionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        reaffirmationHistory: [],
        nextReaffirmationDue: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        // Additional comprehensive fields
        contactPersons: [...new Set(contactPersons)], // Remove duplicates
        recipientTypes: [...new Set(recipientTypes)], // Remove duplicates
        dataSubjectTypeDetails: [
          {
            type: dataSubjectType,
            transferLocation: Math.random() > 0.5 ? 'Inside Country' : 'Outside Country',
            categoryOfData,
            dataTransferPurpose: purpose
          }
        ],
        output: OUTPUTS[Math.floor(Math.random() * OUTPUTS.length)],
        remediation: REMEDIATIONS[Math.floor(Math.random() * REMEDIATIONS.length)]
      },
      reaffirmationStatus: status,
      nextReaffirmationDue: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastReaffirmedAt: status !== 'CURRENT' ? undefined : new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastReaffirmedBy: status !== 'CURRENT' ? undefined : 'legal-user',
      // Additional fields for combination
      jurisdiction: versionJurisdiction, // Same jurisdiction for all combinations
      status: status === 'CURRENT' ? 'Active' : status === 'DUE_SOON' ? 'Review Required' : 'Overdue',
      contactPersons: [...new Set(contactPersons)],
      categoryOfData,
      output: OUTPUTS[Math.floor(Math.random() * OUTPUTS.length)],
      remediation: REMEDIATIONS[Math.floor(Math.random() * REMEDIATIONS.length)]
    });
  }

  return combinations;
};

// Generate entity summaries (300 entities)
export const generateEntitySummaries = (): EntitySummary[] => {
  const entityNames = generateEntityNames();
  const entities: EntitySummary[] = [];

  entityNames.forEach((name, index) => {
    // Random number of combinations per entity (average ~67 to reach 20k total)
    const combinationCount = Math.floor(Math.random() * 100) + 20; // 20-120 combinations per entity
    const dueCount = Math.floor(combinationCount * 0.2); // ~20% due soon
    const overdueCount = Math.floor(combinationCount * 0.15); // ~15% overdue

    entities.push({
      id: `entity-${index}`,
      name,
      totalRequirements: combinationCount,
      dueRequirements: dueCount,
      overdueRequirements: overdueCount,
      versionsLoaded: false,
      versions: [],
      totalVersions: 0,
      combinationsLoaded: false,
      combinations: [],
      totalCombinations: combinationCount
    });
  });

  return entities;
};
