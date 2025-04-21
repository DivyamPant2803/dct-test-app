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