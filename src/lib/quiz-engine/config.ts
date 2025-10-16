
export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'number'
  | 'text'
  | 'date'
  | 'yes_no'
  | 'height'
  | 'weight'
  | 'unit_toggle'
  | 'computed_bmi'
  | 'chart_bmi'
  | 'message'
  | 'testimonial'
  | 'diet_info'
  | 'loader'
  | 'prediction'
  | 'profile_card'
  | 'lead_capture';

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
  minLength?: number;
  maxLength?: number;
  minSelected?: number;
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
  label: string; // Keep top-level label for simplicity in some components
  description?: string;
  hint?: string;
  options?: QuestionOption[];
  i18n?: QuestionI18n; // Make i18n optional for backward compatibility if needed
  analytics_key?: string;
  validation?: ValidationRules;
  branching?: BranchingRule | null;
  ui?: Record<string, any>;
  source?: string;
  emoji?: string;
  disclaimer?: string;
}

export interface SectionI18n {
    en: { title: string };
    ru?: { title: string };
}

export interface Section {
  id: string;
  title: string;
  order?: number;
  i18n?: SectionI18n;
}

export interface QuizConfig {
  id: string;
  quizId?: string; // a more semantic name for the quiz id
  version?: string;
  sections: Section[];
  questions: Question[];
}
