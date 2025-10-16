'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Progress } from '@/components/ui/progress';

const QuizProgress = () => {
  const { state } = useQuizEngine();
  const { currentSection, sections } = state;
  if (!currentSection) return null;

  const currentSectionIndex = sections.findIndex(s => s.id === currentSection.id);
  const progressPercentage = ((currentSectionIndex + 1) / sections.length) * 100;
  
  return (
    <div className="w-full text-center">
      <div className='flex justify-between items-center px-1 mb-1'>
        <p className="text-sm font-semibold text-foreground">
            {currentSection.i18n.en.title}
        </p>
        <p className='text-xs text-muted-foreground'>~5-7 min remaining</p>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default QuizProgress;
