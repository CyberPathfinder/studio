
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getLabel, getDescription } from '@/lib/i18n';

const YesNo = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full max-w-md mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => handleAnswerChange(question.id, true, question.analytics_key)}
          variant={answer === true ? 'default' : 'outline'}
          className={cn("w-32 h-12 text-lg", answer === true && 'ring-2 ring-primary')}
        >
          Yes
        </Button>
        <Button
          onClick={() => handleAnswerChange(question.id, false, question.analytics_key)}
          variant={answer === false ? 'default' : 'outline'}
          className={cn("w-32 h-12 text-lg", answer === false && 'ring-2 ring-primary')}
        >
          No
        </Button>
      </div>
    </div>
  );
};

export default YesNo;
