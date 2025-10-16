
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getLabel, getDescription, getOptions } from '@/lib/i18n';

const UnitToggle = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const options = getOptions(question);
  const answer = state.answers[question.id] || options?.[0].value;

  return (
    <div className="w-full max-w-md mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>
      
      <RadioGroup
        onValueChange={(value) => handleAnswerChange(question.id, value, question.analytics_key)}
        value={answer}
        className="flex rounded-md border p-1 w-fit mx-auto"
        aria-label={getLabel(question)}
      >
        {options?.map((option) => (
          <div key={option.value}>
            <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} className="sr-only" />
            <Label
              htmlFor={`${question.id}-${option.value}`}
              className={cn(
                "px-4 py-2 rounded-md text-base cursor-pointer",
                answer === option.value && "bg-muted font-semibold"
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default UnitToggle;
