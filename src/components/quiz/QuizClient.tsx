'use client';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAuth } from '@/firebase';
import { getQuizDraft, saveQuizDraft } from '@/firebase/quiz';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import quizConfig from '@/lib/questions.json';
import ResumePrompt from './ResumePrompt';
import QuizEngine from './QuizEngine';

const LOCAL_STORAGE_KEY = 'vf_quiz_draft';

const QuizClient = () => {
  const { user, isUserLoading } = useAuth();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [draftToResume, setDraftToResume] = useState<Record<string, any> | null>(null);

  const {
    state,
    dispatch,
    isInitialized,
    initializeState,
  } = useQuizEngine(quizConfig);
  const { track } = useAnalytics();

  // 1. Check for drafts on load
  useEffect(() => {
    if (isInitialized || isUserLoading) return;

    let draftPromise: Promise<Record<string, any> | null>;

    if (user) {
      draftPromise = getQuizDraft(user.uid, quizConfig.id);
    } else {
      const localDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      draftPromise = Promise.resolve(localDraft ? JSON.parse(localDraft) : null);
    }

    draftPromise.then((draft) => {
      if (draft && Object.keys(draft.answers).length > 0) {
        setDraftToResume(draft.answers);
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
    if (!state.isDirty || isUserLoading) return;

    const saveData = async () => {
      if (user) {
        await saveQuizDraft(user.uid, quizConfig.id, { answers: state.answers, currentQuestionId: state.currentQuestionId });
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ answers: state.answers, currentQuestionId: state.currentQuestionId }));
      }
      dispatch({ type: 'SAVE_COMPLETE' });
    };

    saveData();
  }, [state.answers, user, isUserLoading, state.isDirty, quizConfig.id, state.currentQuestionId, dispatch]);


  const handleResume = (resume: boolean) => {
    if (resume && draftToResume) {
      initializeState(draftToResume);
    } else {
      initializeState({});
      track('quiz_start');
    }
    setShowResumePrompt(false);
    setDraftToResume(null);
  };

  if (!isInitialized) {
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

export default QuizClient;
