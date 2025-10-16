'use client';
import { useQuiz } from '@/hooks/use-quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const QuizControls = () => {
  const { prevStep, nextStep, isFirstStep, isLastStep } = useQuiz();

  if (isLastStep) {
    return null; // Hide controls on the summary/sign-up step
  }

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        onClick={prevStep}
        disabled={isFirstStep}
        aria-label="Go to previous step"
        className={isFirstStep ? 'invisible' : 'visible'}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button onClick={nextStep} aria-label={'Go to next step'}>
        Next
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default QuizControls;
