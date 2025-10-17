
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Progress } from '@/components/ui/progress';
import { getLabel } from '@/lib/i18n';
import { useMemo } from 'react';
import { evaluateBranchingLogic } from '@/lib/quiz-engine/utils';

const QuizProgress = () => {
  const { state } = useQuizEngine();
  const { currentSection } = state;

  const progressPercentage = useMemo(() => {
    if (!currentSection) return 0;
    const visibleSections = [...new Set(state.config.questions
        .filter(q => evaluateBranchingLogic(q.branching, state.answers))
        .map(q => q.section)
    )];
    
    const totalVisibleSections = state.sections.filter(s => visibleSections.includes(s.id));
    const currentSectionIndex = totalVisibleSections.findIndex(s => s.id === currentSection.id);

    if (currentSectionIndex === -1) return 100; // Summary page
    return ((currentSectionIndex + 1) / totalVisibleSections.length) * 100;

  }, [currentSection, state.sections, state.config.questions, state.answers]);
  
  if (!currentSection) return <div className="h-6" />;

  return (
    <div className="w-full text-center">
      <div className='flex justify-between items-center px-1 mb-1'>
        <p className="text-sm font-semibold text-foreground">
            {currentSection.i18n?.en.title || currentSection.title}
        </p>
        <p className='text-xs text-muted-foreground'>~5-7 min remaining</p>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default QuizProgress;
