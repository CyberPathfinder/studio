
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import { evaluateBranchingLogic } from '@/lib/quiz-engine/utils';

const QuizControls = () => {
  const { state, nextQuestion, prevQuestion, canSkip } = useQuizEngine();
  const { toast } = useToast();

  const isNextDisabled = useMemo(() => {
    const q = state.currentQuestion;
    if (!q) return true;

    if (q.id === 'height') {
        const heightCm = state.answers.body?.heightCm;
        return !heightCm || heightCm < 120 || heightCm > 230;
    }

    if (q.id === 'weight') {
        const weightKg = state.answers.body?.weightKg;
        return !weightKg || weightKg < 35 || weightKg > 300;
    }
    
    if (q.id === 'goal_weight') {
        const goalWeightKg = state.answers.body?.goalWeightKg;
        return !goalWeightKg || goalWeightKg < 35 || goalWeightKg > 300;
    }
    
    return false;
  }, [state.currentQuestion, state.answers.body]);


  const handleNext = () => {
    const result = nextQuestion();
    if (result && !result.isValid) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: result.message,
      });
    }
  };

  const handleSkip = () => {
    // This action implicitly skips validation.
    nextQuestion(true);
  }

  const { visibleQuestions, currentVisibleIndex } = useMemo(() => {
    const visible = state.config.questions.filter(q => evaluateBranchingLogic(q.branching, state.answers));
    const currentIndex = visible.findIndex(q => q.id === state.currentQuestionId);
    return {
        visibleQuestions: visible,
        currentVisibleIndex: currentIndex,
    }
  }, [state.config.questions, state.answers, state.currentQuestionId]);

  return (
    <div className="flex justify-between items-center w-full">
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

      <div className="text-sm font-medium text-muted-foreground" aria-live="polite">
        Step {currentVisibleIndex + 1} of {visibleQuestions.length}
      </div>

      <div className="flex items-center gap-2">
        {canSkip && (
            <Button variant="link" onClick={handleSkip} aria-label="Skip question">
                Skip
            </Button>
        )}
        {state.isLastQuestion ? (
            <Button onClick={handleNext} aria-label="Finish Quiz" disabled={isNextDisabled}>
                Finish
                <Check className="ml-2 h-4 w-4" />
            </Button>
        ) : (
            <Button onClick={handleNext} aria-label="Go to next step" disabled={isNextDisabled}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        )}
      </div>
    </div>
  );
};

export default QuizControls;
