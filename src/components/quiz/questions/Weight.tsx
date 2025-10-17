
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getHealthyWeightRange } from '@/lib/unit-conversion';
import { getLabel, getDescription } from '@/lib/i18n';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useMemo } from 'react';

const Weight = ({ question }: { question: Question }) => {
  const { state, dispatch, handleAnswerChange } = useQuizEngine();
  const { toast } = useToast();
  
  const isGoalWeightQuestion = question.id === 'goal_weight';
  
  const { 
    unitWeight = 'metric', 
    weightKg,
    weightKgView = '', 
    weightLbView = '',
    goalWeightKg,
    goalWeightKgView = '',
    goalWeightLbView = '',
  } = state.answers.body || {};
  
  const { heightCm } = state.answers.body || {};

  const displayValue = isGoalWeightQuestion
    ? (unitWeight === 'metric' ? goalWeightKgView : goalWeightLbView)
    : (unitWeight === 'metric' ? weightKgView : weightLbView);
  
  const canonicalValue = isGoalWeightQuestion ? goalWeightKg : weightKg;

  const suggestedGoalKg = useMemo(() => {
    if (isGoalWeightQuestion && weightKg && !goalWeightKg) {
      return parseFloat((weightKg * 0.95).toFixed(1));
    }
    return null;
  }, [isGoalWeightQuestion, weightKg, goalWeightKg]);
  
  useEffect(() => {
    if (suggestedGoalKg !== null) {
      dispatch({ type: 'SET_BODY_CANONICAL', payload: { field: 'goalWeightKg', value: suggestedGoalKg, analyticsKey: question.analytics_key }});
    }
  }, [suggestedGoalKg, dispatch, question.analytics_key]);

  const showAmbitiousGoalToast = useDebouncedCallback(() => {
    toast({
        title: 'Ambitious Goal',
        description: `This is an ambitious goal, but we'll help you pace it safely.`,
    });
  }, 1000);


  const handleViewChange = (value: string) => {
    const field = isGoalWeightQuestion 
        ? (unitWeight === 'metric' ? 'goalWeightKgView' : 'goalWeightLbView')
        : (unitWeight === 'metric' ? 'weightKgView' : 'weightLbView');
        
    dispatch({ type: 'SET_BODY_VIEW_FIELD', payload: { field, value, analyticsKey: question.analytics_key } });

    // Perform soft validations after state update
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      const valueInKg = unitWeight === 'lb' ? numericValue / 2.20462 : numericValue;

      const min = question.validation?.min || 35;
      const max = question.validation?.max || 300;
      if (valueInKg < min || valueInKg > max) {
        toast({
            title: 'Unusual Weight',
            description: `The weight seems unusual. Please double-check if it's correct.`
        });
      }

      if (isGoalWeightQuestion && weightKg && valueInKg) {
        const lossPercentage = ((weightKg - valueInKg) / weightKg) * 100;
        const [minHealthy] = getHealthyWeightRange(heightCm);

        if (lossPercentage > 25 || valueInKg < minHealthy) {
            showAmbitiousGoalToast();
        }
      }
    }
  };

  const handleUnitChange = (newUnit: 'metric' | 'lb') => {
    dispatch({ type: 'SET_BODY_UNIT', payload: { unitType: 'weight', unit: newUnit } });
  };


  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>

        <div className="flex items-center gap-2 mt-2 max-w-xs mx-auto">
            <Input
              id={`${question.id}-weight`}
              type="number"
              inputMode='decimal'
              value={displayValue}
              onChange={(e) => handleViewChange(e.target.value)}
              placeholder={unitWeight === 'metric' ? 'e.g., 70' : 'e.g., 154'}
              className="text-center text-lg h-12"
            />
            <RadioGroup
              value={unitWeight}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1"
            >
              <RadioGroupItem value="metric" id="kg" className="sr-only" />
              <Label htmlFor="kg" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", unitWeight === 'metric' && "bg-muted font-semibold")}>kg</Label>
              <RadioGroupItem value="imperial" id="lb" className="sr-only" />
              <Label htmlFor="lb" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", unitWeight === 'imperial' && "bg-muted font-semibold")}>lb</Label>
            </RadioGroup>
        </div>
    </div>
  );
};

export default Weight;
