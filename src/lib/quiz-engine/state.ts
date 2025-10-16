import { QuizConfig, Question, Section } from './config';
import { evaluateBranchingLogic } from './utils';

export interface QuizState {
  config: QuizConfig;
  answers: Record<string, any>;
  currentQuestionId: string | null;
  currentQuestionIndex: number;
  status: 'loading' | 'in-progress' | 'completed';
  isDirty: boolean; // Has been modified since last save
  // Computed properties
  currentQuestion: Question | null;
  currentSection: Section | null;
  sections: Section[];
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export const getInitialState = (config: QuizConfig): QuizState => {
    return {
        config,
        answers: {},
        currentQuestionId: null,
        currentQuestionIndex: -1,
        status: 'loading',
        isDirty: false,
        // Computed
        currentQuestion: null,
        currentSection: null,
        sections: config.sections.sort((a,b) => a.order - b.order),
        isFirstQuestion: true,
        isLastQuestion: false,
    };
};

type Action =
  | { type: 'INITIALIZE_STATE'; payload: { config: QuizConfig, initialAnswers: Record<string, any>, currentQuestionId?: string | null } }
  | { type: 'SET_ANSWER'; payload: { questionId: string; value: any } }
  | { type: 'SET_QUESTION'; payload: number }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SAVE_COMPLETE' };

export const quizReducer = (state: QuizState, action: Action): QuizState => {
  let newState = { ...state };
  switch (action.type) {
    case 'INITIALIZE_STATE':
        const { config, initialAnswers, currentQuestionId } = action.payload;
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
            answers: initialAnswers,
            status: 'in-progress',
            currentQuestionIndex: startIndex,
            currentQuestionId: config.questions[startIndex]?.id || null,
        };
        break;

    case 'SET_ANSWER':
      newState.answers = {
        ...newState.answers,
        [action.payload.questionId]: action.payload.value,
      };
      newState.isDirty = true;
      break;

    case 'SET_QUESTION':
      newState.currentQuestionIndex = action.payload;
      newState.currentQuestionId = newState.config.questions[action.payload]?.id || null;
      break;

    case 'COMPLETE_QUIZ':
      newState.status = 'completed';
      newState.currentQuestionId = null;
      newState.currentQuestionIndex = -1;
      break;
    
    case 'SAVE_COMPLETE':
      newState.isDirty = false;
      break;
      
    default:
      return state;
  }

  // Compute derived state
  newState.currentQuestion = newState.config.questions[newState.currentQuestionIndex] || null;
  if(newState.currentQuestion) {
    newState.currentSection = newState.config.sections.find(s => s.id === newState.currentQuestion?.section) || null;
  } else {
    // If quiz is complete, show the last section in the progress bar
    newState.currentSection = newState.config.sections[newState.config.sections.length - 1] || null;
  }
  
  // Re-evaluate isFirstQuestion and isLastQuestion
  const visibleQuestions = newState.config.questions.filter(q => evaluateBranchingLogic(q.branching, newState.answers));
  const firstVisibleQuestion = visibleQuestions[0];
  const lastVisibleQuestion = visibleQuestions[visibleQuestions.length - 1];

  newState.isFirstQuestion = newState.currentQuestion?.id === firstVisibleQuestion?.id;
  newState.isLastQuestion = newState.currentQuestion?.id === lastVisibleQuestion?.id;

  return newState;
};
