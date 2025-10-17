
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription, getOptions } from '@/lib/i18n';

const MultiChoice = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const currentAnswers: string[] = state.answers[question.id] || [];
  const options = getOptions(question);

  const onSelect = (value: string) => {
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter((v) => v !== value)
      : [...currentAnswers, value];
    handleAnswerChange(question.id, newAnswers, question.analytics_key);
  };

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8" id={`${question.id}-label`}>
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>

      <div role="group" aria-labelledby={`${question.id}-label`} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options?.map((option) => (
          <div key={option.value} className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox
              id={`${question.id}-${option.value}`}
              checked={currentAnswers.includes(option.value)}
              onCheckedChange={() => onSelect(option.value)}
            />
            <Label htmlFor={`${question.id}-${option.value}`} className="font-normal w-full cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChoice;
