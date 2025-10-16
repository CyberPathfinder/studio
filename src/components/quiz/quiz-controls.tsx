'use client';
import { useQuiz } from '@/hooks/use-quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const QuizControls = () => {
  const { prevStep, nextStep, isFirstStep, isLastStep } = useQuiz();

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
      <Button onClick={nextStep} aria-label={isLastStep ? 'Complete quiz' : 'Go to next step'}>
        {isLastStep ? 'Finish' : 'Next'}
        {isLastStep ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
};

export default QuizControls;
