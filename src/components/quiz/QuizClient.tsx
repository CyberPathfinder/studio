
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useFirebase } from '@/firebase';
import { getQuizDraft, saveQuizDraft } from '@/firebase/quiz';
import { useAnalytics } from '@/hooks/use-analytics';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { logger } from '@/lib/logger';
import quizConfig from '@/data/questions.json';

import ResumePrompt from './ResumePrompt';
import QuizEngine from './QuizEngine';

const LOCAL_STORAGE_KEY = 'vf_quiz_draft';

const QuizClient = () => {
  const { user, isUserLoading } = useFirebase();
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [draftToResume, setDraftToResume] = useState<Record<string, any> | null>(null);
  const searchParams = useSearchParams();
  const jumpTo = searchParams.get('qid');

  const {
    state,
    dispatch,
    isInitialized,
    initializeState,
    jumpToQuestion,
  } = useQuizEngine();
  const { track } = useAnalytics();

  // 1. Initialize the quiz engine immediately on mount.
  useEffect(() => {
    if (!isInitialized) {
      initializeState({}, null);
    }
  }, [isInitialized, initializeState]);

  // Handle direct jump from URL
  useEffect(() => {
     if (isInitialized && jumpTo) {
        jumpToQuestion(jumpTo);
    }
  }, [isInitialized, jumpTo, jumpToQuestion]);

  // 2. Check for drafts on load (after initial render)
  useEffect(() => {
    // Only check for drafts once, and don't run while checking auth state.
    if (isUserLoading) return;

    let draftPromise: Promise<Record<string, any> | null>;

    if (user) {
      draftPromise = getQuizDraft(user.uid, quizConfig.quizId);
    } else {
      draftPromise = Promise.resolve(null);

      const localDraftRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localDraftRaw) {
        try {
          const parsedDraft = JSON.parse(localDraftRaw) as Record<string, any>;
          draftPromise = Promise.resolve(parsedDraft);
        } catch (error) {
          logger.warn('Failed to parse local quiz draft.', error);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    }

    let isActive = true;

    draftPromise
      .then((draft) => {
        if (!isActive) return;

        // Don't show resume prompt if we are jumping to a specific question
        if (draft && draft.answers && Object.keys(draft.answers).length > 0 && !jumpTo) {
          setDraftToResume(draft);
          setShowResumePrompt(true);
        } else if (!jumpTo) {
          // No draft and not jumping, so we can track the start event.
          // If there was a draft, this is handled in `handleResume`.
          track('quiz_start');
        }
      })
      .catch((error) => {
        logger.error('Failed to load quiz draft.', error);
      });

    // This effect should only run once when the user's auth state is resolved.
    return () => {
      isActive = false;
    };
  }, [user, isUserLoading, track, jumpTo]);


  // 3. Autosave logic (debounced in hook)
  useEffect(() => {
    if (!state.isDirty || isUserLoading || !isInitialized) return;

    const draftData = {
      answers: state.answers,
      currentQuestionId: state.currentQuestionId,
    };

    void (async () => {
      try {
        if (user) {
          await saveQuizDraft(user.uid, quizConfig.quizId, draftData);
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
        }
        dispatch({ type: 'SAVE_COMPLETE' });
      } catch (error) {
        logger.error('Failed to save quiz draft.', error);
      }
    })();
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
