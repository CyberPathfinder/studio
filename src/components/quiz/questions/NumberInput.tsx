'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const NumberInput = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full max-w-md mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{question.i18n.en.label}</CardTitle>
        {question.i18n.en.description && <CardDescription>{question.i18n.en.description}</CardDescription>}
      </CardHeader>
      
      <Label htmlFor={question.id} className="sr-only">{question.i18n.en.label}</Label>
      <Input
        id={question.id}
        type="number"
        value={answer || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.analytics_key)}
        placeholder={question.i18n.en.hint || ''}
        min={question.validation?.min}
        max={question.validation?.max}
        step={question.validation?.step}
        className="text-center text-lg h-12"
      />
    </div>
  );
};

export default NumberInput;
