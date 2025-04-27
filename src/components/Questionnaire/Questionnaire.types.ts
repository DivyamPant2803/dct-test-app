export interface DataSubjectCategory {
  category: string;
  options: string[];
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple';
  options: string[] | DataSubjectCategory[];
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

export interface Country {
  name: string;
  code: string;
  region: string;
} 