
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription, getHint } from '@/lib/i18n';

const NumberInput = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full max-w-md mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>
      
      <Label htmlFor={question.id} className="sr-only">{getLabel(question)}</Label>
      <Input
        id={question.id}
        type="number"
        value={answer || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.analytics_key)}
        placeholder={getHint(question) || ''}
        min={question.validation?.min}
        max={question.validation?.max}
        step={question.validation?.step}
        className="text-center text-lg h-12"
      />
    </div>
  );
};

export default NumberInput;
