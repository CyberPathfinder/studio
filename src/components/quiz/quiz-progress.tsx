'use client';
import { useQuiz } from '@/hooks/use-quiz';
import { Progress } from '@/components/ui/progress';
import { quizSteps } from '@/lib/quiz-data';

const QuizProgress = () => {
  const { currentStep, totalSteps } = useQuiz();
  const progressPercentage = (currentStep / totalSteps) * 100;
  const currentStepInfo = quizSteps.find(s => s.step === currentStep);

  return (
    <div className="w-full text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Step {currentStep} of {totalSteps}: <span className="text-foreground">{currentStepInfo?.title}</span>
      </p>
      <Progress value={progressPercentage} className="mt-2 h-2" />
    </div>
  );
};

export default QuizProgress;
