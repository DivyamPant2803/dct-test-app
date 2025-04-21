export type EntityCategory = 'Investment' | 'Securities' | 'Wealth' | 'Banking' | 'Insurance';

export interface Entity {
  id: string;
  name: string;
  category: string;
  countryCode: string;
  description?: string;
}

export interface EntityGroup {
  category: string;
  entities: Entity[];
}

export interface BaseQuestion {
  id: string;
  text: string;
  options: string[];
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

export interface MultipleQuestion extends BaseQuestion {
  type: 'multiple';
}

export interface ReviewQuestion extends BaseQuestion {
  type: 'review';
}

export type Question = MultipleQuestion | ReviewQuestion;

export const DATA_SUBJECT_TYPES = {
  PERSON: [
    'Employee',
    'Candidate',
    'Contractor',
    'Former Employee'
  ],
  CLIENT: [
    'Individual Client',
    'Corporate Client Employee',
    'Client Representative',
    'Prospect'
  ]
};

export const RECIPIENT_TYPES = [
  'Group Company',
  'Service Provider',
  'Government Authority',
  'Business Partner'
]; 