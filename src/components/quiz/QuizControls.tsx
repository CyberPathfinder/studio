'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuizControls = () => {
  const { state, nextQuestion, prevQuestion, completeQuiz } = useQuizEngine();
  const { toast } = useToast();

  const handleNext = () => {
    const { isValid, message } = nextQuestion();
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: message,
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Button
        variant="ghost"
        onClick={prevQuestion}
        disabled={state.isFirstQuestion}
        aria-label="Go to previous step"
        className={state.isFirstQuestion ? 'invisible' : 'visible'}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {state.isLastQuestion ? (
        <Button onClick={completeQuiz} aria-label="Complete Quiz">
          Finish
          <Check className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={handleNext} aria-label="Go to next step">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default QuizControls;
