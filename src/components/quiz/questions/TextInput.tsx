
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription, getHint } from '@/lib/i18n';
import { Input } from '@/components/ui/input';

const TextInput = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>
      
      <Label htmlFor={question.id} className="sr-only">{getLabel(question)}</Label>
       <Input
        id={question.id}
        type="text"
        value={answer || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.analytics_key)}
        placeholder={getHint(question) || ''}
        className="h-12 text-lg text-center"
      />
    </div>
  );
};

export default TextInput;
