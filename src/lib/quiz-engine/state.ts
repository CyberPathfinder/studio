
import { QuizConfig, Question, Section } from './config';
import { evaluateBranchingLogic } from './utils';
import { convertCmToFtIn, convertFtInToCm, convertWeight, normalizeInches, roundToTwo } from '@/lib/unit-conversion';

type UnitPref = 'metric' | 'imperial';

export interface BodyAnswers {
  unitHeight: UnitPref;
  unitWeight: UnitPref;

  // Canonical SI storage
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  
  // View fields (for controlled inputs)
  heightCmView: string;
  heightFtView: string;
  heightInView: string;
  
  weightKgView: string;
  weightLbView: string;

  goalWeightKgView: string;
  goalWeightLbView: string;
}

export interface QuizState {
  config: QuizConfig;
  answers: {
    body: BodyAnswers;
    [key: string]: any;
  };
  currentQuestionId: string | null;
  currentQuestionIndex: number;
  status: 'loading' | 'in-progress' | 'completed';
  isDirty: boolean; // Has been modified since last save
  lastSaved: Date | null;
  // Computed properties
  currentQuestion: Question | null;
  currentSection: Section | null;
  sections: Section[];
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

const initialBodyState: BodyAnswers = {
    unitHeight: 'metric',
    unitWeight: 'metric',
    heightCmView: '',
    heightFtView: '',
    heightInView: '',
    weightKgView: '',
    weightLbView: '',
    goalWeightKgView: '',
    goalWeightLbView: '',
};

export const getInitialState = (config: QuizConfig): QuizState => {
    return {
        config,
        answers: {
          body: { ...initialBodyState }
        },
        currentQuestionId: null,
        currentQuestionIndex: -1,
        status: 'loading',
        isDirty: false,
        lastSaved: null,
        // Computed
        currentQuestion: null,
        currentSection: null,
        sections: config.sections,
        isFirstQuestion: true,
        isLastQuestion: false,
    };
};

type Action =
  | { type: 'INITIALIZE_STATE'; payload: { config: QuizConfig, initialAnswers: Record<string, any>, currentQuestionId?: string | null } }
  | { type: 'SET_ANSWER'; payload: { questionId: string; value: any, analyticsKey?: string } }
  | { type: 'SET_QUESTION_BY_INDEX'; payload: number }
  | { type: 'SET_STATUS'; payload: 'loading' | 'in-progress' | 'completed' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SAVE_COMPLETE' }
  | { type: 'SET_BODY_UNIT'; payload: { unitType: 'height' | 'weight', unit: UnitPref } }
  | { type: 'SET_BODY_VIEW_FIELD'; payload: { field: keyof BodyAnswers, value: string, analyticsKey?: string } }
  | { type: 'SET_BODY_CANONICAL'; payload: { field: 'heightCm' | 'weightKg' | 'goalWeightKg', value: number | null, analyticsKey?: string } };

export const quizReducer = (state: QuizState, action: Action): QuizState => {
  let newState = { ...state, answers: { ...state.answers, body: { ...state.answers.body } as BodyAnswers } };
  
  switch (action.type) {
    case 'INITIALIZE_STATE':
        const { config, initialAnswers, currentQuestionId } = action.payload;
        newState.config.questions.sort((a,b) => a.order - b.order);
        newState.config.sections.sort((a,b) => (a.order || 0) - (b.order || 0));

        let startIndex = -1;

        if (currentQuestionId) {
            startIndex = config.questions.findIndex(q => q.id === currentQuestionId);
        }

        // If no specific question ID is provided, find the first valid question
        if (startIndex === -1) {
            startIndex = config.questions.findIndex(q => evaluateBranchingLogic(q.branching, initialAnswers));
        }
        
        newState = {
            ...getInitialState(config),
            answers: { ...initialAnswers, body: { ...initialBodyState, ...(initialAnswers.body || {}) } },
            status: 'in-progress',
            currentQuestionIndex: startIndex,
            currentQuestionId: config.questions[startIndex]?.id || null,
        };
        // After initializing with any saved answers, load the view models
        if (newState.answers.body?.heightCm) {
          const { feet, inches } = convertCmToFtIn(newState.answers.body.heightCm);
          newState.answers.body.heightCmView = roundToTwo(newState.answers.body.heightCm).toString();
          newState.answers.body.heightFtView = feet.toString();
          newState.answers.body.heightInView = inches.toString();
        }
        if (newState.answers.body?.weightKg) {
            newState.answers.body.weightKgView = roundToTwo(newState.answers.body.weightKg).toString();
            newState.answers.body.weightLbView = roundToTwo(convertWeight(newState.answers.body.weightKg, 'kg', 'lb')).toString();
        }
        if (newState.answers.body?.goalWeightKg) {
            newState.answers.body.goalWeightKgView = roundToTwo(newState.answers.body.goalWeightKg).toString();
            newState.answers.body.goalWeightLbView = roundToTwo(convertWeight(newState.answers.body.goalWeightKg, 'kg', 'lb')).toString();
        }
        break;

    case 'SET_ANSWER':
      newState.answers = {
        ...newState.answers,
        [action.payload.questionId]: action.payload.value,
      };
      newState.isDirty = true;
      break;

    case 'SET_BODY_VIEW_FIELD': {
        const { field, value } = action.payload;
        const body = newState.answers.body!;
        
        // 1. Update the string-based view field that the user is editing.
        (body[field] as any) = value.replace(/[^0-9.]/g, '');


        // 2. Derive the canonical (SI unit) value from the view fields.
        let newCanonicalValue: number | undefined;

        if (field.startsWith('height')) {
            const feet = parseFloat(body.heightFtView) || 0;
            const inches = parseFloat(body.heightInView) || 0;
            const cm = parseFloat(body.heightCmView) || 0;
            newCanonicalValue = body.unitHeight === 'metric' ? cm : convertFtInToCm(feet, inches);
            body.heightCm = newCanonicalValue > 0 ? newCanonicalValue : undefined;
        
        } else if (field.startsWith('weight')) {
            const kg = parseFloat(body.weightKgView) || 0;
            const lb = parseFloat(body.weightLbView) || 0;
            newCanonicalValue = body.unitWeight === 'metric' ? kg : convertWeight(lb, 'lb', 'kg');
            body.weightKg = newCanonicalValue > 0 ? newCanonicalValue : undefined;
        
        } else if (field.startsWith('goalWeight')) {
            const kg = parseFloat(body.goalWeightKgView) || 0;
            const lb = parseFloat(body.goalWeightLbView) || 0;
            newCanonicalValue = body.unitWeight === 'metric' ? kg : convertWeight(lb, 'lb', 'kg');
            body.goalWeightKg = newCanonicalValue > 0 ? newCanonicalValue : undefined;
        }

        // 3. Sync all view fields from the new canonical value to ensure consistency.
        if (body.heightCm) {
            const { feet, inches } = convertCmToFtIn(body.heightCm);
            body.heightFtView = feet > 0 ? feet.toString() : '';
            body.heightInView = inches > 0 ? roundToTwo(inches).toString() : '';
            if (body.unitHeight === 'metric') {
              body.heightCmView = body.heightCm > 0 ? roundToTwo(body.heightCm).toString() : '';
            }
        }
        if (body.weightKg) {
            body.weightLbView = body.weightKg > 0 ? roundToTwo(convertWeight(body.weightKg, 'kg', 'lb')).toString() : '';
             if (body.unitWeight === 'metric') {
              body.weightKgView = body.weightKg > 0 ? roundToTwo(body.weightKg).toString() : '';
            }
        }
        if (body.goalWeightKg) {
            body.goalWeightLbView = body.goalWeightKg > 0 ? roundToTwo(convertWeight(body.goalWeightKg, 'kg', 'lb')).toString() : '';
            if (body.unitWeight === 'metric') {
              body.goalWeightKgView = body.goalWeightKg > 0 ? roundToTwo(body.goalWeightKg).toString() : '';
            }
        }
        
        newState.isDirty = true;
        break;
    }

    case 'SET_BODY_CANONICAL': {
        const { field, value } = action.payload;
        const body = newState.answers.body!;
        body[field] = value ?? undefined;

        if (field === 'heightCm') {
            const { feet, inches } = convertCmToFtIn(value);
            body.heightCmView = value ? roundToTwo(value).toString() : '';
            body.heightFtView = feet.toString();
            body.heightInView = roundToTwo(inches).toString();
        } else if (field === 'weightKg') {
            body.weightKgView = value ? roundToTwo(value).toString() : '';
            body.weightLbView = value ? roundToTwo(convertWeight(value, 'kg', 'lb')).toString() : '';
        } else if (field === 'goalWeightKg') {
            body.goalWeightKgView = value ? roundToTwo(value).toString() : '';
            body.goalWeightLbView = value ? roundToTwo(convertWeight(value, 'kg', 'lb')).toString() : '';
        }
        newState.isDirty = true;
        break;
    }

    case 'SET_BODY_UNIT': {
        const { unitType, unit } = action.payload;
        const body = newState.answers.body!;

        if (unitType === 'height') {
          if (body.unitHeight === unit) break; // No change
          body.unitHeight = unit;
        } else if (unitType === 'weight') {
          if (body.unitWeight === unit) break; // No change
          body.unitWeight = unit;
        }
        break;
    }

    case 'SET_QUESTION_BY_INDEX':
      newState.status = 'in-progress'; // If we are setting a question, we are in progress
      newState.currentQuestionIndex = action.payload;
      newState.currentQuestionId = newState.config.questions[action.payload]?.id || null;
      break;

    case 'SET_STATUS':
        newState.status = action.payload;
        break;

    case 'COMPLETE_QUIZ':
      newState.status = 'completed';
      newState.currentQuestionId = null;
      newState.currentQuestionIndex = -1;
      break;
    
    case 'SAVE_COMPLETE':
      newState.isDirty = false;
      newState.lastSaved = new Date();
      break;
      
    default:
      return state;
  }

  // Compute derived state
  newState.currentQuestion = newState.config.questions[newState.currentQuestionIndex] || null;
  if(newState.currentQuestion) {
    newState.currentSection = newState.config.sections.find(s => s.id === newState.currentQuestion?.section) || null;
  } else if (newState.status === 'completed') {
    // If quiz is complete, show the last section in the progress bar
    newState.currentSection = newState.sections[newState.sections.length - 1] || null;
  }
  
  // Re-evaluate isFirstQuestion and isLastQuestion
  const visibleQuestions = newState.config.questions.filter(q => evaluateBranchingLogic(q.branching, newState.answers));
  const firstVisibleQuestion = visibleQuestions[0];
  const lastVisibleQuestion = visibleQuestions[visibleQuestions.length - 1];

  newState.isFirstQuestion = newState.currentQuestion?.id === firstVisibleQuestion?.id;
  newState.isLastQuestion = newState.currentQuestion?.id === lastVisibleQuestion?.id;

  return newState;
};
