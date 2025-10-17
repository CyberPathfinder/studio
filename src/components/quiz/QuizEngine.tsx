
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import QuizProgress from './QuizProgress';
import QuizControls from './QuizControls';
import * as QuestionComponents from './questions';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import QuizSummary from './QuizSummary';
import { useIsMobile } from '@/hooks/use-mobile';


const QuizEngine = () => {
  const { state } = useQuizEngine();
  const { currentQuestion } = state;
  const isMobile = useIsMobile(1280);
  const quizCardRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            const target = e.target as HTMLElement;
            // Don't trigger on textareas or buttons to allow normal interaction
            if(target.nodeName !== 'TEXTAREA' && target.nodeName !== 'BUTTON') {
                e.preventDefault();
                // This will trigger the `nextQuestion` function via the controls component
                document.querySelector<HTMLButtonElement>('button[aria-label="Go to next step (Enter)"], button[aria-label="Finish Quiz (Enter)"]')?.click();
            }
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            // This will trigger the `prevQuestion` function via the controls component
            document.querySelector<HTMLButtonElement>('button[aria-label="Go to previous step (Shift + Enter)"]')?.click();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top on question change
  useEffect(() => {
    if (quizCardRef.current) {
        quizCardRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.currentQuestionId]);


  if (state.status === 'completed') {
    return (
        <div className="flex items-center justify-center p-4">
            <QuizSummary />
        </div>
    );
  }

  if (!currentQuestion) {
     return (
        <div className="flex items-center justify-center">
             <Card className="text-center p-8 max-w-lg">
                <h1 className="text-xl font-bold">Loading your quiz...</h1>
            </Card>
        </div>
    );
  }

  const QuestionComponent = QuestionComponents[currentQuestion.type as keyof typeof QuestionComponents];
  const MotionCard = motion(Card);

  return (
      <AnimatePresence mode="wait">
        <MotionCard
          key={state.currentQuestionId}
          ref={quizCardRef}
          initial={{ opacity: 0.92, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-3xl overflow-hidden shadow-md rounded-2xl flex flex-col"
        >
          <div className="p-6 md:p-8 pb-28 md:pb-8">
              <QuizProgress />
              <div role="region" aria-labelledby={`question-${currentQuestion.id}`} className="relative mt-8 min-h-[28rem] flex items-center justify-center">
                  {QuestionComponent ? <QuestionComponent question={currentQuestion} /> : <div>Unknown question type: {currentQuestion.type}</div>}
              </div>
          </div>
          <div className={cn(
              "bg-muted/60 p-6 border-t mt-auto",
              "md:relative", // Stays at bottom of card on desktop
              isMobile && "fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          )}>
              <QuizControls />
          </div>
        </MotionCard>
      </AnimatePresence>
  );
};

export default QuizEngine;
