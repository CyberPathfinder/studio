'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const TextInput = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{question.i18n.en.label}</CardTitle>
        {question.i18n.en.description && <CardDescription>{question.i18n.en.description}</CardDescription>}
      </CardHeader>
      
      <Label htmlFor={question.id} className="sr-only">{question.i18n.en.label}</Label>
      <Textarea
        id={question.id}
        value={answer || ''}
        onChange={(e) => handleAnswerChange(question.id, e.target.value, question.analytics_key)}
        placeholder={question.i18n.en.hint || ''}
        className="h-32"
      />
    </div>
  );
};

export default TextInput;
