export const DATA_SUBJECT_TYPES = {
  CLIENT: {
    category: 'Client',
    options: ['Client', 'Prospect', 'CS Client'] as string[]
  },
  PERSON: {
    category: 'Person',
    options: ['Employee', 'Candidate', 'CS Employee'] as string[]
  }
} as const;

export const REGIONS = {
  APAC: 'APAC',
  EMEA: 'EMEA',
  CH: 'CH',
  US: 'United States',
} as const;

export const COUNTRIES_DATA = {
  APAC: [
    { name: 'Japan', code: 'JP', region: 'APAC' },
    { name: 'South Korea', code: 'KR', region: 'APAC' },
    { name: 'Singapore', code: 'SG', region: 'APAC' },
    { name: 'India', code: 'IN', region: 'APAC' },
    { name: 'China', code: 'CN', region: 'APAC' },
    { name: 'Australia', code: 'AU', region: 'APAC' },
    { name: 'New Zealand', code: 'NZ', region: 'APAC' },
  ],
  EMEA: [
    { name: 'United Kingdom', code: 'GB', region: 'EMEA' },
    { name: 'Germany', code: 'DE', region: 'EMEA' },
    { name: 'France', code: 'FR', region: 'EMEA' },
    { name: 'Spain', code: 'ES', region: 'EMEA' },
    { name: 'Italy', code: 'IT', region: 'EMEA' },
    { name: 'Netherlands', code: 'NL', region: 'EMEA' },
    { name: 'Belgium', code: 'BE', region: 'EMEA' },
    { name: 'Austria', code: 'AT', region: 'EMEA' },
    { name: 'Ireland', code: 'IE', region: 'EMEA' },
    { name: 'Sweden', code: 'SE', region: 'EMEA' },
    { name: 'Norway', code: 'NO', region: 'EMEA' },
    { name: 'Denmark', code: 'DK', region: 'EMEA' },
    { name: 'Finland', code: 'FI', region: 'EMEA' },
    { name: 'Portugal', code: 'PT', region: 'EMEA' },
    { name: 'United Arab Emirates', code: 'AE', region: 'EMEA' },
    { name: 'Saudi Arabia', code: 'SA', region: 'EMEA' },
  ],
  CH: [
    { name: 'Switzerland', code: 'CH', region: 'Switzerland' },
  ],
  US: [
    { name: 'United States', code: 'US', region: 'United States' },
  ],
};

export const baseQuestions = [
  // Preliminary Questions
  {
    id: 'informationCategory',
    text: 'Select Information Category',
    type: 'multiple',
    options: ['Client', 'Employee'],
  },
  {
    id: 'dataSubjectType',
    text: 'Select Data Subject Type',
    type: 'multiple',
    options: [] as string[],
    dependsOn: {
      questionId: 'informationCategory',
      value: '',
    },
  },
  {
    id: 'countries',
    text: 'Select the countries',
    type: 'multiple',
    options: Object.values(COUNTRIES_DATA).flat().map(country => country.name),
  },
  {
    id: 'entities',
    text: 'Select the entities',
    type: 'multiple',
    options: [], // Will be populated dynamically
    dependsOn: {
      questionId: 'countries',
      value: '',
    },
  },
  {
    id: 'transferLocation',
    text: 'Select Transfer Location',
    type: 'multiple',
    options: ['Inside Country', 'Outside Country'],
  },
  {
    id: 'recipientType',
    text: 'Select Recipient Types',
    type: 'multiple',
    options: [], // Will be filled from RECIPIENT_TYPES
  },
  {
    id: 'reviewDataTransferPurpose',
    text: 'Review Data Transfer Purpose',
    type: 'multiple',
    options: [],
  },
] as const; 