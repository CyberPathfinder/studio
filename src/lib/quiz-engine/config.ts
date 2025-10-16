export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'number'
  | 'text'
  | 'date'
  | 'yes_no'
  | 'height_weight'
  | 'unit_toggle';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
}

export interface BranchingRule {
  show_if: string;
}

export interface QuestionI18n {
  en: {
    label: string;
    description?: string;
    hint?: string;
    options?: QuestionOption[];
  };
  ru?: {
    label: string;
    description?: string;
    hint?: string;
    options?: QuestionOption[];
  };
}

export interface Question {
  id: string;
  section: string;
  order: number;
  type: QuestionType;
  i18n: QuestionI18n;
  analytics_key?: string;
  validation?: ValidationRules;
  branching?: BranchingRule | null;
}

export interface SectionI18n {
    en: { title: string };
    ru?: { title: string };
}

export interface Section {
  id: string;
  order: number;
  i18n: SectionI18n;
}

export interface QuizConfig {
  id: string;
  version: string;
  sections: Section[];
  questions: Question[];
}
