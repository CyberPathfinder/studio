'use client';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAuth, useFirebase } from '@/firebase';
import { getQuizDraft, saveQuizDraft } from '@/firebase/quiz';
import { useQuizEngine, QuizProvider } from '@/hooks/useQuizEngine';
import quizConfig from '@/data/questions.json';
import ResumePrompt from './ResumePrompt';
import QuizEngine from './QuizEngine';

const LOCAL_STORAGE_KEY = 'vf_quiz_draft';

const QuizClientInternal = () => {
  const { user, isUserLoading } = useFirebase();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [draftToResume, setDraftToResume] = useState<Record<string, any> | null>(null);

  const {
    state,
    dispatch,
    isInitialized,
    initializeState,
  } = useQuizEngine();
  const { track } = useAnalytics();

  // 1. Check for drafts on load
  useEffect(() => {
    if (isInitialized || isUserLoading) return;

    let draftPromise: Promise<any | null>;

    if (user) {
      draftPromise = getQuizDraft(user.uid, quizConfig.id);
    } else {
      const localDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      draftPromise = Promise.resolve(localDraft ? JSON.parse(localDraft) : null);
    }

    draftPromise.then((draft) => {
      if (draft && draft.answers && Object.keys(draft.answers).length > 0) {
        setDraftToResume(draft);
        setShowResumePrompt(true);
      } else {
        // No draft, initialize fresh
        initializeState({});
        track('quiz_start');
      }
    });
  }, [user, isUserLoading, isInitialized, initializeState, track]);


  // 2. Autosave logic (debounced in hook)
  useEffect(() => {
    if (!state.isDirty || isUserLoading || !isInitialized) return;

    const saveData = async () => {
        const draftData = {
            answers: state.answers,
            currentQuestionId: state.currentQuestionId,
        };
      if (user) {
        await saveQuizDraft(user.uid, quizConfig.id, draftData);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
      }
      dispatch({ type: 'SAVE_COMPLETE' });
    };

    saveData();
  }, [state.answers, user, isUserLoading, state.isDirty, quizConfig.id, state.currentQuestionId, dispatch, isInitialized]);


  const handleResume = (resume: boolean) => {
    if (resume && draftToResume) {
      initializeState(draftToResume.answers, draftToResume.currentQuestionId);
      track('quiz_resume');
    } else {
      initializeState({});
      if (user) {
        // If they chose not to resume, clear the server draft
        saveQuizDraft(user.uid, quizConfig.id, { answers: {}, currentQuestionId: null });
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
      track('quiz_start');
    }
    setShowResumePrompt(false);
    setDraftToResume(null);
  };

  if (!isInitialized && !showResumePrompt) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <p>Loading Quiz...</p>
            </div>
        </div>
    );
  }

  if (showResumePrompt) {
    return <ResumePrompt onResume={handleResume} />;
  }

  return <QuizEngine />;
};

const QuizClient = () => (
    <QuizProvider config={quizConfig as any}>
        <QuizClientInternal />
    </QuizProvider>
)

export default QuizClient;
