
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Progress } from '@/components/ui/progress';
import { useMemo, useState, useEffect } from 'react';
import { evaluateBranchingLogic } from '@/lib/quiz-engine/utils';
import { formatDistanceToNow } from 'date-fns';

const AutosaveIndicator = () => {
    const { state } = useQuizEngine();
    const { isDirty, lastSaved } = state;
    const [relativeTime, setRelativeTime] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (lastSaved) {
            const update = () => setRelativeTime(formatDistanceToNow(lastSaved, { addSuffix: true }));
            update();
            const interval = setInterval(update, 10000); // update every 10 seconds
            return () => clearInterval(interval);
        }
    }, [lastSaved]);

    if (!isClient) {
        return <span className='text-xs text-muted-foreground'>~5-7 min remaining</span>;
    }
    
    if (isDirty) {
        return <span className='text-xs text-muted-foreground'>Saving...</span>;
    }
    if (lastSaved) {
        return <span className='text-xs text-muted-foreground'>Saved {relativeTime}</span>
    }
    return <span className='text-xs text-muted-foreground'>~5-7 min remaining</span>
}

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
        <AutosaveIndicator />
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default QuizProgress;
