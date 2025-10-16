'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import QuizProgress from './QuizProgress';
import QuizControls from './QuizControls';
import * as QuestionComponents from './questions';

const QuizEngine = () => {
  const { state } = useQuizEngine();
  const { currentQuestion } = state;

  if (!currentQuestion) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Quiz Completed!</h1>
                <p className="text-muted-foreground">Thank you for your responses.</p>
            </div>
        </div>
    );
  }

  const QuestionComponent = QuestionComponents[currentQuestion.type as keyof typeof QuestionComponents];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-4 left-4 text-primary font-bold text-lg">VivaForm</div>
      <Card className="w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-8">
          <QuizProgress />
          <div className="relative mt-8 h-[28rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.currentQuestionId}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                {QuestionComponent ? <QuestionComponent question={currentQuestion} /> : <div>Unknown question type: {currentQuestion.type}</div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="bg-gray-50 p-4 border-t">
          <QuizControls />
        </div>
      </Card>
    </div>
  );
};

export default QuizEngine;
