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
  nextQuestion: () => { isValid: boolean, message?: string };
  prevQuestion: () => void;
  completeQuiz: () => void;
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
  }, 800);

  const nextQuestion = useCallback(() => {
    const { currentQuestion, answers } = state;
    if (!currentQuestion) return { isValid: false, message: 'No current question' };

    const { isValid, message } = validateAnswer(currentQuestion, answers[currentQuestion.id]);
    if (!isValid) {
      return { isValid: false, message };
    }

    let nextIndex = state.currentQuestionIndex + 1;
    while (nextIndex < config.questions.length) {
      const nextQ = config.questions[nextIndex];
      if (evaluateBranchingLogic(nextQ.branching, answers)) {
        dispatch({ type: 'SET_QUESTION', payload: nextIndex });
        track('quiz_step', { stepId: nextQ.id });
        return { isValid: true };
      }
      nextIndex++;
    }
    
    // No more questions
    dispatch({ type: 'COMPLETE_QUIZ' });
    track('quiz_complete');
    return { isValid: true };

  }, [state, config.questions, track]);

  const prevQuestion = useCallback(() => {
    const { answers } = state;
    let prevIndex = state.currentQuestionIndex - 1;
    while (prevIndex >= 0) {
      const prevQ = config.questions[prevIndex];
      if (evaluateBranchingLogic(prevQ.branching, answers)) {
        dispatch({ type: 'SET_QUESTION', payload: prevIndex });
        return;
      }
      prevIndex--;
    }
  }, [state, config.questions]);

  const completeQuiz = () => {
    track('quiz_complete');
    dispatch({ type: 'COMPLETE_QUIZ' });
  }

  const isInitialized = useMemo(() => state.status !== 'loading', [state.status]);

  const value = {
    state,
    dispatch,
    isInitialized,
    initializeState,
    handleAnswerChange,
    nextQuestion,
    prevQuestion,
    completeQuiz
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
