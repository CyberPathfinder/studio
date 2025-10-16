'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SingleChoice = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id];

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{question.i18n.en.label}</CardTitle>
        {question.i18n.en.description && <CardDescription>{question.i18n.en.description}</CardDescription>}
      </CardHeader>
      
      <RadioGroup
        onValueChange={(value) => handleAnswerChange(question.id, value, question.analytics_key)}
        value={answer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        aria-label={question.i18n.en.label}
      >
        {question.i18n.en.options?.map((option) => (
          <div key={option.value}>
            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} className="sr-only" />
            <Label
              htmlFor={`${question.id}-${option.value}`}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                answer === option.value && 'border-primary shadow-lg'
              )}
            >
              <span className="font-bold">{option.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default SingleChoice;
