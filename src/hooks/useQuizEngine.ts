'use client';
import { QuizConfig } from '@/lib/quiz-engine/config';
import { quizReducer, getInitialState } from '@/lib/quiz-engine/state';
import { evaluateBranchingLogic, validateAnswer } from '@/lib/quiz-engine/utils';
import { useReducer, useCallback, useMemo, useContext, createContext, ReactNode } from 'react';
import { useAnalytics } from './use-analytics';
import { useDebouncedCallback } from 'use-debounce';

type QuizEngineContextType = {
  state: ReturnType<typeof quizReducer>;
  dispatch: React.Dispatch<any>;
  isInitialized: boolean;
  initializeState: (initialAnswers: Record<string, any>, currentQuestionId?: string | null) => void;
  handleAnswerChange: (questionId: string, value: any, analyticsKey?: string) => void;
  nextQuestion: (skipValidation?: boolean) => { isValid: boolean, message?: string };
  prevQuestion: () => void;
  completeQuiz: () => void;
  jumpToQuestion: (questionId: string) => void;
  canSkip: boolean;
};

const QuizEngineContext = createContext<QuizEngineContextType | null>(null);

export const QuizEngineProvider = ({ children, config }: { children: ReactNode, config: QuizConfig }) => {
  const { track } = useAnalytics();
  const [state, dispatch] = useReducer(quizReducer, getInitialState(config));

  const initializeState = useCallback((initialAnswers: Record<string, any>, currentQuestionId: string | null = null) => {
    dispatch({ type: 'INITIALIZE_STATE', payload: { config, initialAnswers, currentQuestionId } });
  }, [config]);

  const handleAnswerChange = useDebouncedCallback((questionId: string, value: any, analyticsKey?: string) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, value } });
    if (analyticsKey) {
        track('quiz_answer', { id: analyticsKey, value });
    }
  }, 300);

  const nextQuestion = useCallback((skipValidation = false) => {
    const { currentQuestion, answers } = state;
    if (!currentQuestion) return { isValid: false, message: 'No current question' };

    if (!skipValidation) {
        const { isValid, message } = validateAnswer(currentQuestion, answers[currentQuestion.id]);
        if (!isValid) {
          return { isValid: false, message };
        }
    }

    let nextIndex = state.currentQuestionIndex + 1;
    while (nextIndex < config.questions.length) {
      const nextQ = config.questions[nextIndex];
      if (evaluateBranchingLogic(nextQ.branching, answers)) {
        dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: nextIndex });
        track('quiz_step', { stepId: nextQ.id });
        return { isValid: true };
      }
      nextIndex++;
    }
    
    // No more questions, which means we're on the last question.
    // The next "action" is to complete the quiz.
    if (state.isLastQuestion) {
        completeQuiz();
    }
    
    return { isValid: true };

  }, [state, config.questions, track]);

  const prevQuestion = useCallback(() => {
    const { answers } = state;
    let prevIndex = state.currentQuestionIndex - 1;
    while (prevIndex >= 0) {
      const prevQ = config.questions[prevIndex];
      if (evaluateBranchingLogic(prevQ.branching, answers)) {
        dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: prevIndex });
        track('quiz_step', { stepId: prevQ.id, direction: 'previous' });
        return;
      }
      prevIndex--;
    }
  }, [state, config.questions, track]);
  
  const jumpToQuestion = useCallback((questionId: string) => {
      const questionIndex = config.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
          dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: questionIndex });
          track('quiz_step', { stepId: questionId, direction: 'jump' });
      }
  }, [config.questions, track]);

  const completeQuiz = () => {
    track('quiz_complete');
    dispatch({ type: 'COMPLETE_QUIZ' });
  }

  const isInitialized = useMemo(() => state.status !== 'loading', [state.status]);

  const canSkip = useMemo(() => {
    if (!state.currentQuestion || !state.currentQuestion.validation) {
        return true;
    }
    return !state.currentQuestion.validation.required;
  }, [state.currentQuestion]);

  const value = {
    state,
    dispatch,
    isInitialized,
    initializeState,
    handleAnswerChange,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    jumpToQuestion,
    canSkip
  };

  return (
    <QuizEngineContext.Provider value={value}>
      {children}
    </QuizEngineContext.Provider>
  );
};


export const useQuizEngine = () => {
  const context = useContext(QuizEngineContext);
  if (!context) {
    throw new Error('useQuizEngine must be used within a QuizEngineProvider');
  }
  return context;
};

// Top-level provider for the quiz page
export const QuizProvider = ({ children, config }: { children: ReactNode, config: QuizConfig }) => (
    <QuizEngineProvider config={config}>
        {children}
    </QuizEngineProvider>
);
