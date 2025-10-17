
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import QuizProgress from './QuizProgress';
import QuizControls from './QuizControls';
import * as QuestionComponents from './questions';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import QuizSummary from './QuizSummary';
import { useIsMobile } from '@/hooks/use-mobile';


const QuizEngine = () => {
  const { state } = useQuizEngine();
  const { currentQuestion } = state;
  const isMobile = useIsMobile();

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
  }, []); // Empty dependency array means this effect runs once on mount

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

  return (
    <div className="relative flex flex-col items-center justify-start p-4">
      <Card className="w-full max-w-3xl overflow-hidden shadow-md rounded-2xl flex flex-col">
          <div className="p-6 md:p-8 pb-24 md:pb-8">
              <QuizProgress />
              <div className="relative mt-8 h-[28rem] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                  <motion.div
                      key={state.currentQuestionId}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="absolute w-full px-4 md:px-0"
                  >
                      {QuestionComponent ? <QuestionComponent question={currentQuestion} /> : <div>Unknown question type: {currentQuestion.type}</div>}
                  </motion.div>
                  </AnimatePresence>
              </div>
          </div>
          <div className={cn(
              "bg-muted/60 p-6 border-t",
              "md:relative", // Stays at bottom of card on desktop
              isMobile && "fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm pb-[calc(1rem+env(safe-area-inset-bottom))]"
          )}>
              <QuizControls />
          </div>
      </Card>
    </div>
  );
};

export default QuizEngine;
