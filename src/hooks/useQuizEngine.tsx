
'use client';
import { QuizConfig } from '@/lib/quiz-engine/config';
import { quizReducer, getInitialState } from '@/lib/quiz-engine/state';
import { evaluateBranchingLogic, validateAnswer } from '@/lib/quiz-engine/utils';
import { useReducer, useCallback, useMemo, useContext, createContext, ReactNode, Dispatch } from 'react';
import { useAnalytics } from './use-analytics';
import { useDebouncedCallback } from 'use-debounce';
import { saveIntakeData } from '@/firebase/quiz';

type QuizEngineContextType = {
  state: ReturnType<typeof quizReducer>;
  dispatch: Dispatch<any>;
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

   const debouncedTrackAnswer = useDebouncedCallback((analyticsKey: string, value: any, answers: Record<string, any>) => {
    if (analyticsKey) {
        let payload:any = { analyticsKey, value };

        // Add special payload for goal_weight
        if (analyticsKey === 'goal_weight_kg' && answers.body?.weightKg > 0 && value > 0) {
            const delta = value - answers.body.weightKg;
            const deltaPct = (delta / answers.body.weightKg) * 100;
            payload.delta = delta;
            payload.deltaPct = deltaPct;
        }

        track('quiz_answer', payload);
    }
  }, 1000);

  const handleAnswerChange = useCallback((questionId: string, value: any, analyticsKey?: string) => {
    dispatch({ type: 'SET_ANSWER', payload: { questionId, value } });
    if (analyticsKey) {
        const updatedAnswers = { ...state.answers, [questionId]: value };
        debouncedTrackAnswer(analyticsKey, value, updatedAnswers);
    }
  }, [debouncedTrackAnswer, state.answers]);

  const completeQuiz = useCallback(() => {
    track('quiz_complete');
    dispatch({ type: 'COMPLETE_QUIZ' });
  },[track]);

  const nextQuestion = useCallback((skipValidation = false) => {
    const { currentQuestion, answers, isLastQuestion } = state;
    if (!currentQuestion) return { isValid: false, message: 'No current question' };

    // Skip validation for new body questions since it's handled in the component
    if (!skipValidation && !['height', 'weight', 'goal_weight'].includes(currentQuestion.id)) {
        const { isValid, message } = validateAnswer(currentQuestion, answers[currentQuestion.id]);
        if (!isValid) {
          return { isValid: false, message };
        }
    }
    
    if (isLastQuestion) {
        completeQuiz();
        return; // Explicitly return nothing
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
    
    // If no next question is found (we are on the last visible question), complete the quiz
    completeQuiz();

  }, [state, config.questions, track, completeQuiz]);

  const prevQuestion = useCallback(() => {
    const { answers } = state;
    if (state.status === 'completed') {
        const lastQuestionIndex = config.questions.map(q => evaluateBranchingLogic(q.branching, answers)).lastIndexOf(true);
        dispatch({ type: 'SET_QUESTION_BY_INDEX', payload: lastQuestionIndex });
        track('quiz_step', { stepId: config.questions[lastQuestionIndex].id, direction: 'jump' });
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
    const { answers } = state;
    const intakeData = {
        createdAt: new Date().toISOString(),
        version: "v1",
        profile: {
            name: answers.name,
            age: answers.age,
            sex: answers.sex
        },
        measures: {
            height_cm: answers.body?.heightCm,
            weight_kg: answers.body?.weightKg,
            goal_weight_kg: answers.body?.goalWeightKg,
            bmi: answers.bmi_calc,
        },
        preferences: {
            diet_style: answers.diet_style,
            food_prefs: answers.food_prefs,
            meat_prefs: answers.meat_prefs
        },
        habits: {
            activity_level: answers.activity,
            lost_before: answers.lost_before,
            ideal_weight_time: answers.ideal_when,
            eating_habits: answers.eating_habits,
            cooking_skill: answers.cooking_skill,
            water_intake: answers.water_intake,
            work_schedule: answers.work_schedule,
            support_system: answers.start_with_support,
        },
        health: {
            sleep_quality: answers.sleep_quality,
            health_risks: answers.health_risks,
            energy_levels: answers.energy_levels,
            mobility_limitations: answers.mobility_limited,
            activity_assistance: answers.need_help_activities,
            missed_activities: answers.miss_activities,
            self_esteem_impact: answers.self_esteem,
            family_concern: answers.family_concern,
            medications: answers.medications,
            allergies: answers.allergies,
        }
    };

    await saveIntakeData(uid, 'initial', intakeData);
    track('intake_saved');
    // Also clear local draft if it exists
    localStorage.removeItem('vf_quiz_draft');
  };


  const isInitialized = useMemo(() => state.status === 'in-progress' || state.status === 'completed', [state.status]);

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
