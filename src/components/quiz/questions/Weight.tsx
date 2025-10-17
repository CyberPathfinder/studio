
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
import { useAnalytics } from '@/hooks/use-analytics';


const Weight = ({ question }: { question: Question }) => {
  const { state, dispatch } = useQuizEngine();
  const { track } = useAnalytics();
  const { toast } = useToast();
  
  const isGoalWeightQuestion = question.id === 'goal_weight';
  
  const { 
    unitWeight = 'metric', 
    weightKg,
    weightKgView, 
    weightLbView,
    goalWeightKg,
    goalWeightKgView,
    goalWeightLbView,
    heightCm
  } = state.answers.body || {};
  
  const displayValue = isGoalWeightQuestion
    ? (unitWeight === 'metric' ? goalWeightKgView : goalWeightLbView)
    : (unitWeight === 'metric' ? weightKgView : weightLbView);
  
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
        title: state.translations.toasts.ambitious_goal.title,
        description: state.translations.toasts.ambitious_goal.description,
    });
  }, 1000);


  const debouncedDispatch = useDebouncedCallback((field: keyof import('@/lib/quiz-engine/state').BodyAnswers, value: string) => {
    dispatch({ type: 'SET_BODY_VIEW_FIELD', payload: { field, value, analyticsKey: question.analytics_key }});
  }, 300);

  const handleViewChange = (value: string) => {
    const field = isGoalWeightQuestion 
        ? (unitWeight === 'metric' ? 'goalWeightKgView' : 'goalWeightLbView')
        : (unitWeight === 'metric' ? 'weightKgView' : 'weightLbView');
    
    // Optimistic update for responsive UI
    dispatch({ type: 'SET_VIEW_ONLY', payload: { field, value } });
    debouncedDispatch(field, value);

    // Perform soft validations after state update
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      const valueInKg = unitWeight === 'imperial' ? numericValue / 2.20462 : numericValue;

      if (isGoalWeightQuestion && weightKg && valueInKg) {
        const lossPercentage = ((weightKg - valueInKg) / weightKg) * 100;
        const [minHealthy] = getHealthyWeightRange(heightCm);

        if (lossPercentage > 25 || valueInKg < minHealthy) {
            showAmbitiousGoalToast();
        }
      }
    }
  };

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    track('quiz_unit_change', { field: isGoalWeightQuestion ? 'goal_weight' : 'weight', unit: newUnit });
    dispatch({ type: 'SET_BODY_UNIT', payload: { unitType: 'weight', unit: newUnit } });
  };


  return (
    <div className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question, state.locale)}</CardTitle>
      </CardHeader>

      <div className='flex justify-center mb-8'>
            <RadioGroup
              value={unitWeight}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1 bg-muted/50"
            >
              <RadioGroupItem value="metric" id="kg" className="sr-only" />
              <Label htmlFor="kg" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitWeight === 'metric' && "bg-background font-semibold shadow-sm")}>{state.translations.units.kg}</Label>
              <RadioGroupItem value="imperial" id="lb" className="sr-only" />
              <Label htmlFor="lb" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitWeight === 'imperial' && "bg-background font-semibold shadow-sm")}>{state.translations.units.lb}</Label>
            </RadioGroup>
      </div>

       <div className="max-w-xs mx-auto">
            <Label htmlFor={`${question.id}-weight`} className="sr-only">{state.translations.labels.weight}</Label>
            <Input
                id={`${question.id}-weight`}
                type="number"
                inputMode='decimal'
                value={displayValue}
                onChange={(e) => handleViewChange(e.target.value)}
                placeholder={unitWeight === 'metric' ? state.translations.placeholders.weight_kg : state.translations.placeholders.weight_lb}
                className="text-center text-xl h-16 rounded-lg shadow-inner"
                autoFocus
            />
      </div>
      
      {getDescription(question) && <p className="text-center text-sm text-muted-foreground mt-8">{getDescription(question, state.locale)}</p>}
    </div>
  );
};

export default Weight;
