import { COUNTRIES_DATA, REGIONS } from './Questionnaire.data';
import type { Country } from './Questionnaire.types';
import { FormData } from '../../App';

export const getAllCountries = (): Country[] => {
  return Object.values(COUNTRIES_DATA).flat();
};

export const getCountriesForRegion = (region: keyof typeof REGIONS): Country[] => {
  return COUNTRIES_DATA[region];
};

// OutputCombination type (should match OutputCards)
export type OutputCombination = {
  id: string;
  country: string;
  entity: string;
  type: string;
  legalOrBusiness: string;
  transferType: string;
  purpose: string;
  output: string;
  risk: string;
  status: string;
  contact: string;
  dateGenerated: string;
  versionDate: string;
  requirements: string[];
  actions: string[];
  remediation: string[];
};

const getRequirementsByCategory = (category: string) => {
  switch (category) {
    case 'Employee':
      return [
        'Employment Contract Update Required',
        'Internal Privacy Policy Update',
        'Works Council Consultation',
        'Data Processing Agreement'
      ];
    case 'Client':
      return [
        'Client Data Processing Agreement',
        'Privacy Notice Update Required',
        'Explicit Consent Required',
        'Data Transfer Impact Assessment'
      ];
    default:
      return ['Data Protection Agreement Required'];
  }
};

export const getActionsBySubjectType = (subjectType: string) => {
  switch (subjectType) {
    case 'Current Employee':
      return [
        'Update employment contracts',
        'Provide privacy notice',
        'Document transfer purpose',
        'Maintain transfer records'
      ];
    case 'Client Employee':
      return [
        'Obtain client authorization',
        'Update service agreements',
        'Document transfer basis',
        'Implement data minimization'
      ];
    default:
      return [
        'Obtain explicit consent',
        'Document transfer purpose',
        'Maintain transfer records'
      ];
  }
};

const getRemediationByRecipientType = (recipientType: string) => {
  switch (recipientType) {
    case 'Group Entity':
      return [
        'Implement BCRs',
        'Regular compliance audits',
        'Access controls review'
      ];
    case 'Third Party':
      return [
        'Vendor assessment',
        'Data processing agreement',
        'Regular audits',
        'Access restrictions'
      ];
    default:
      return [
        'Implement encryption',
        'Regular audits',
        'Access controls'
      ];
  }
};

export const getTransferStatus = (country: string): 'allowed' | 'restricted' | 'prohibited' => {
  const restrictedCountries = ['China', 'Russia', 'India'];
  const prohibitedCountries = ['North Korea', 'Iran', 'Mexico'];
  if (prohibitedCountries.includes(country)) return 'prohibited';
  if (restrictedCountries.includes(country)) return 'restricted';
  return 'allowed';
};

const getContactPerson = (country: string) => {
  const contacts: Record<string, string> = {
    'United States': 'US Data Protection Officer',
    'United Kingdom': 'UK Data Protection Officer',
    'Germany': 'EU Data Protection Officer',
    'France': 'EU Data Protection Officer',
    'Japan': 'APAC Data Protection Officer',
    'Singapore': 'APAC Data Protection Officer',
    'Australia': 'APAC Data Protection Officer',
  };
  return contacts[country] || 'Global Data Protection Officer';
};

export const getLegalRequirements = (category: string, transferStatus: 'allowed' | 'restricted' | 'prohibited') => {
  if (transferStatus === 'allowed') return [];
  const baseRequirements = getRequirementsByCategory(category);
  const additionalRequirements = transferStatus === 'prohibited' 
    ? ['Transfer Impact Assessment Required', 'Executive Approval Required', 'Local DPO Consultation Required']
    : ['Additional Safeguards Required', 'Risk Assessment Required'];
  return [...baseRequirements, ...additionalRequirements];
};

export function transformFormDataForCards(data: FormData): OutputCombination[] {
  const combinations: OutputCombination[] = [];
  const currentDate = new Date().toISOString().split('T')[0];
  data.countries.forEach(country => {
    const entities = data.entities[country] || [];
    entities.forEach(entity => {
      data.informationCategory.forEach(category => {
        data.dataSubjectType.forEach(subjectType => {
          data.recipientType.forEach(recipient => {
            const transferStatus = getTransferStatus(country);
            combinations.push({
              id: `${Math.random()}-${country}-${entity}-${category}-${Date.now()}`,
              country,
              entity,
              type: subjectType,
              legalOrBusiness: category === 'Employee' ? 'Legal' : 'Business',
              transferType: 'Inside the Country', // You can enhance this if you have transfer location info
              purpose: 'Monitoring', // You can enhance this if you have purpose info
              output: transferStatus === 'allowed' ? 'OK' : transferStatus === 'restricted' ? 'OKC' : 'NOK',
              risk: transferStatus === 'prohibited' ? 'High' : transferStatus === 'restricted' ? 'Medium' : 'Low',
              status: 'Active',
              contact: getContactPerson(country),
              dateGenerated: currentDate,
              versionDate: currentDate,
              requirements: getLegalRequirements(category, transferStatus),
              actions: getActionsBySubjectType(subjectType),
              remediation: getRemediationByRecipientType(recipient),
            });
          });
        });
      });
    });
  });
  return combinations;
} 