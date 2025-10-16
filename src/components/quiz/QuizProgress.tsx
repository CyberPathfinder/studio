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
      <p className="text-sm font-medium text-muted-foreground">
        Section {currentSectionIndex + 1} of {sections.length}: <span className="text-foreground">{currentSection.i18n.en.title}</span>
      </p>
      <Progress value={progressPercentage} className="mt-2 h-2" />
    </div>
  );
};

export default QuizProgress;
