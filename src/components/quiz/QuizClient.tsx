'use client';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';
import { useFirebase } from '@/firebase/provider';
import { getQuizDraft, saveQuizDraft } from '@/firebase/quiz';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import quizConfig from '@/data/questions.json';
import ResumePrompt from './ResumePrompt';
import QuizEngine from './QuizEngine';

const LOCAL_STORAGE_KEY = 'vf_quiz_draft';

const QuizClient = () => {
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

  // 1. Initialize the quiz engine immediately on mount.
  useEffect(() => {
    if (!isInitialized) {
        initializeState({}, null);
    }
  }, [isInitialized, initializeState]);

  // 2. Check for drafts on load (after initial render)
  useEffect(() => {
    // Only check for drafts once, and don't run while checking auth state.
    if (isUserLoading) return;

    let draftPromise: Promise<any | null>;

    if (user) {
      draftPromise = getQuizDraft(user.uid, quizConfig.quizId);
    } else {
      const localDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
      draftPromise = Promise.resolve(localDraft ? JSON.parse(localDraft) : null);
    }

    draftPromise.then((draft) => {
      if (draft && draft.answers && Object.keys(draft.answers).length > 0) {
        setDraftToResume(draft);
        setShowResumePrompt(true);
      } else {
        // No draft, so we can track the start event.
        // If there was a draft, this is handled in `handleResume`.
        track('quiz_start');
      }
    });
    // This effect should only run once when the user's auth state is resolved.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading]);


  // 3. Autosave logic (debounced in hook)
  useEffect(() => {
    if (!state.isDirty || isUserLoading || !isInitialized) return;

    const saveData = async () => {
        const draftData = {
            answers: state.answers,
            currentQuestionId: state.currentQuestionId,
        };
      if (user) {
        await saveQuizDraft(user.uid, quizConfig.quizId, draftData);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
      }
      dispatch({ type: 'SAVE_COMPLETE' });
    };

    saveData();
  }, [state.answers, user, isUserLoading, state.isDirty, state.currentQuestionId, dispatch, isInitialized]);


  const handleResume = (resume: boolean) => {
    if (resume && draftToResume) {
      initializeState(draftToResume.answers, draftToResume.currentQuestionId);
      track('quiz_resume');
    } else {
      initializeState({}, null);
      if (user) {
        // If they chose not to resume, clear the server draft
        saveQuizDraft(user.uid, quizConfig.quizId, { answers: {}, currentQuestionId: null });
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
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

  return (
    <div>
        {showResumePrompt && <ResumePrompt onResume={handleResume} />}
        <QuizEngine />
    </div>
  );
};


export default QuizClient;
