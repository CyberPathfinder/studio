
'use client';
import { QuizConfig } from '@/lib/quiz-engine/config';
import { quizReducer, getInitialState } from '@/lib/quiz-engine/state';
import { evaluateBranchingLogic, validateAnswer } from '@/lib/quiz-engine/utils';
import { useReducer, useCallback, useMemo, useContext, createContext, ReactNode } from 'react';
import { useAnalytics } from './use-analytics';
import { useDebouncedCallback } from 'use-debounce';
import { deleteQuizDraft, saveIntakeData } from '@/firebase/quiz';
import { getLabel } from '@/lib/i18n';

type QuizEngineContextType = {
  state: ReturnType<typeof quizReducer>;
  dispatch: React.Dispatch<any>;
  isInitialized: boolean;
  initializeState: (initialAnswers: Record<string, any>, currentQuestionId?: string | null) => void;
  handleAnswerChange: (questionId: string, value: any, analyticsKey?: string) => void;
  nextQuestion: (skipValidation?: boolean) => { isValid: boolean, message?: string } | void;
  prevQuestion: () => void;
  completeQuiz: () => void;
  jumpToQuestion: (questionId: string) => void;
  canSkip: boolean;
  submitQuiz: (uid: string) => Promise<void>;
};

const QuizEngineContext = createContext<QuizEngineContextType | null>(null);

export const QuizEngineProvider = ({ children, config }: { children: ReactNode, config: QuizConfig }) => {
  const { track } = useAnalytics();
  const [state, dispatch] = useReducer(quizReducer, getInitialState(config));

  const initializeState = useCallback((initialAnswers: Record<string, any>, currentQuestionId: string | null = null) => {
    dispatch({ type: 'INITIALIZE_STATE', payload: { config, initialAnswers, currentQuestionId } });
  }, [config]);

  const handleAnswerChange = useDebouncedCallback((questionId: string, value: any, analyticsKey?: string) => {
    if (analyticsKey) {
        track('quiz_step' as any, { analyticsKey, value });
    }
    dispatch({ type: 'SET_ANSWER', payload: { questionId, value } });
  }, 300);

  const completeQuiz = useCallback(() => {
    track('intake_saved');
    dispatch({ type: 'COMPLETE_QUIZ' });
  },[track]);

  const nextQuestion = useCallback((skipValidation = false) => {
    const { currentQuestion, answers } = state;
    if (!currentQuestion) return { isValid: false, message: 'No current question' };

    if (!skipValidation) {
        const { isValid, message } = validateAnswer(currentQuestion, answers[currentQuestion.id]);
        if (!isValid) {
          return { isValid: false, message };
        }
    }

    if (state.isLastQuestion) {
        completeQuiz();
        return;
    }

    let nextIndex = state.currentQuestionIndex + 1;
    while (nextIndex < config.questions.length) {
      const nextQ = config.questions[nextIndex];
      if (evaluateBranchingLogic(nextQ.branching, answers)) {
        dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: nextIndex });
        track('quiz_step', { stepId: nextQ.id, direction: 'next' });
        return { isValid: true };
      }
      nextIndex++;
    }
    
    // If no next question is found, complete the quiz
    completeQuiz();

  }, [state, config.questions, track, completeQuiz]);

  const prevQuestion = useCallback(() => {
    const { answers } = state;
    if (state.status === 'completed') {
        const lastQuestionIndex = config.questions.map(q => evaluateBranchingLogic(q.branching, answers)).lastIndexOf(true);
        dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: lastQuestionIndex });
        return;
    }

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
          if (state.status === 'completed') {
            dispatch({ type: 'SET_STATUS', payload: 'in-progress' });
          }
          dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: questionIndex });
          track('quiz_step', { stepId: questionId, direction: 'jump' });
      }
  }, [config.questions, track, state.status]);

  const submitQuiz = async (uid: string) => {
    track('intake_saved');
    const quizId = config.quizId || config.id;
    await saveIntakeData(uid, quizId, state.answers);
    await deleteQuizDraft(uid, quizId);
    localStorage.removeItem('vf_quiz_draft'); // Also clear local draft
  };


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
    canSkip,
    submitQuiz
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

export const QuizProvider = ({ children, config }: { children: ReactNode, config: QuizConfig }) => (
    <QuizEngineProvider config={config}>
        {children}
    </QuizEngineProvider>
);
