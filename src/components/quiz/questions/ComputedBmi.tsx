
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useMemo } from 'react';
import { getLabel, getDescription } from '@/lib/i18n';
import { computeBmi } from '@/lib/unit-conversion';

const ComputedBmi = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  
  const { heightCm, weightKg } = state.answers.body || {};

  const bmi = useMemo(() => {
    if (heightCm && weightKg) {
      return computeBmi(weightKg, heightCm);
    }
    return null;
  }, [heightCm, weightKg]);

  useEffect(() => {
    // Update the answer in the quiz state if it has changed
    if (state.answers[question.id] !== bmi) {
        handleAnswerChange(question.id, bmi, question.analytics_key);
    }
  }, [bmi, handleAnswerChange, question.id, question.analytics_key, state.answers]);

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <CardHeader className="text-center p-0 mb-4">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        <CardDescription className="mt-2">BMI is an estimate we use to personalize your plan.</CardDescription>
      </CardHeader>
      
      <div className="bg-primary/10 text-primary font-bold text-5xl rounded-lg p-8">
        {bmi !== null ? bmi : '--'}
      </div>
    </div>
  );
};

export default ComputedBmi;
