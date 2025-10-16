'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuizControls = () => {
  const { state, nextQuestion, prevQuestion, canSkip } = useQuizEngine();
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

  const handleSkip = () => {
    const { isValid, message } = nextQuestion(true); // skip validation
    if (!isValid) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: message,
        });
    }
  }

  return (
    <div className="flex justify-between items-center w-full">
      <Button
        variant="ghost"
        onClick={prevQuestion}
        disabled={state.isFirstQuestion}
        aria-label="Go to previous step (Shift + Enter)"
        className={state.isFirstQuestion ? 'invisible' : 'visible'}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center gap-4">
        {canSkip && (
            <Button variant="link" onClick={handleSkip}>
                Skip
            </Button>
        )}
        {state.isLastQuestion ? (
            <Button onClick={handleNext} aria-label="Finish Quiz (Enter)">
            Finish
            <Check className="ml-2 h-4 w-4" />
            </Button>
        ) : (
            <Button onClick={handleNext} aria-label="Go to next step (Enter)">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  );
};

export default QuizControls;
