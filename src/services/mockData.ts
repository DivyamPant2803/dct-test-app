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

// Generate mock requirement combinations
export const generateMockCombinations = (entityName: string, count: number): RequirementCombination[] => {
  const combinations: RequirementCombination[] = [];
  
  for (let i = 0; i < count; i++) {
    const status: ReaffirmationStatus = Math.random() < 0.6 ? 'CURRENT' : Math.random() < 0.7 ? 'DUE_SOON' : 'OVERDUE';
    
    combinations.push({
      id: `combo-${entityName.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      entity: entityName,
      dataSubjectType: DATA_SUBJECT_TYPES[Math.floor(Math.random() * DATA_SUBJECT_TYPES.length)],
      transferLocation: TRANSFER_LOCATIONS[Math.floor(Math.random() * TRANSFER_LOCATIONS.length)],
      recipientType: RECIPIENT_TYPES[Math.floor(Math.random() * RECIPIENT_TYPES.length)],
      reviewDataTransferPurpose: REVIEW_DATA_TRANSFER_PURPOSES[Math.floor(Math.random() * REVIEW_DATA_TRANSFER_PURPOSES.length)],
      requirement: {
        id: `req-${i}`,
        version: 1,
        title: `${status === 'OVERDUE' ? 'GDPR' : status === 'DUE_SOON' ? 'CCPA' : 'PDPA'} Data Protection Requirement ${i + 1}`,
        jurisdiction: TRANSFER_LOCATIONS[Math.floor(Math.random() * TRANSFER_LOCATIONS.length)],
        entity: entityName,
        subjectType: DATA_SUBJECT_TYPES[Math.floor(Math.random() * DATA_SUBJECT_TYPES.length)],
        text: `Sample requirement text for ${entityName} - ${i + 1}`,
        updatedAt: new Date().toISOString(),
        effectiveDate: new Date().toISOString(),
        createdBy: 'admin-user',
        lastModifiedBy: 'legal-user',
        originalIngestionDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        reaffirmationHistory: [],
        nextReaffirmationDue: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      reaffirmationStatus: status,
      nextReaffirmationDue: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastReaffirmedAt: status !== 'CURRENT' ? undefined : new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastReaffirmedBy: status !== 'CURRENT' ? undefined : 'legal-user'
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
