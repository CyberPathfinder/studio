'use client';

import { QuizProvider } from '@/components/quiz/quiz-provider';
import GoalStep from '@/components/quiz/01-goal-step';
import DemographicsStep from '@/components/quiz/02-demographics-step';
import MeasurementsStep from '@/components/quiz/03-measurements-step';
import DietStep from '@/components/quiz/04-diet-step';
import RestrictionsStep from '@/components/quiz/05-restrictions-step';
import ActivityStep from '@/components/quiz/06-activity-step';
import { useQuiz } from '@/hooks/use-quiz';
import { AnimatePresence, motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/use-analytics';
import { useEffect } from 'react';
import QuizProgress from '@/components/quiz/quiz-progress';
import QuizControls from '@/components/quiz/quiz-controls';
import { Card } from '@/components/ui/card';

const stepComponents: { [key: number]: React.ComponentType } = {
  1: GoalStep,
  2: DemographicsStep,
  3: MeasurementsStep,
  4: DietStep,
  5: RestrictionsStep,
  6: ActivityStep,
  // Future steps will be added here
};

const QuizContent = () => {
  const { currentStep } = useQuiz();
  const { track } = useAnalytics();
  const StepComponent = stepComponents[currentStep];

  useEffect(() => {
    if (currentStep === 1) {
      track('quiz_start');
    }
  }, [currentStep, track]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
       <div className="absolute top-4 left-4 text-primary font-bold text-lg">VivaForm</div>
      <Card className="w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-8">
          <QuizProgress />
          <div className="relative mt-8 h-80">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                {StepComponent ? <StepComponent /> : <div>Step not found</div>}
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

export default function QuizPage() {
  return (
    <QuizProvider>
      <QuizContent />
    </QuizProvider>
  );
}
