
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAnalytics } from '@/hooks/use-analytics';


const Weight = ({ question }: { question: Question }) => {
  const { state, dispatch } = useQuizEngine();
  const { track } = useAnalytics();
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
    heightCm
  } = state.answers.body || {};
  
  const displayValue = isGoalWeightQuestion
    ? (unitWeight === 'metric' ? goalWeightKgView : goalWeightLbView)
    : (unitWeight === 'metric' ? weightKgView : weightLbView);
  
  const canonicalValue = isGoalWeightQuestion ? goalWeightKg : weightKg;

  // Use Zod for validation
  const formSchema = z.object({
    weightKg: z.number().min(35, "Вес должен быть не менее 35 кг").max(300, "Вес должен быть не более 300 кг"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: { weightKg: canonicalValue ?? 0 },
  });
  
  // Re-validate when canonical value changes
  useEffect(() => {
    form.setValue('weightKg', canonicalValue ?? 0, { shouldValidate: true });
  }, [canonicalValue, form]);


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
        title: 'Амбициозная цель',
        description: `Это амбициозная цель, но мы поможем вам достичь ее безопасно.`,
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
        <CardTitle className="font-headline text-3xl">{getLabel(question, 'ru')}</CardTitle>
      </CardHeader>

      <div className='flex justify-center mb-8'>
            <RadioGroup
              value={unitWeight}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1 bg-muted/50"
            >
              <RadioGroupItem value="metric" id="kg" className="sr-only" />
              <Label htmlFor="kg" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitWeight === 'metric' && "bg-background font-semibold shadow-sm")}>Килограммы</Label>
              <RadioGroupItem value="imperial" id="lb" className="sr-only" />
              <Label htmlFor="lb" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitWeight === 'imperial' && "bg-background font-semibold shadow-sm")}>Фунты</Label>
            </RadioGroup>
      </div>

       <Form {...form}>
        <form className="space-y-4">
            <FormField
                control={form.control}
                name="weightKg"
                render={() => (
                    <FormItem className="max-w-xs mx-auto">
                        <Label htmlFor={`${question.id}-weight`} className="sr-only">Вес</Label>
                        <FormControl>
                            <Input
                                id={`${question.id}-weight`}
                                type="number"
                                inputMode='decimal'
                                value={displayValue}
                                onChange={(e) => handleViewChange(e.target.value)}
                                placeholder={unitWeight === 'metric' ? 'Например, 70' : 'Например, 154'}
                                className="text-center text-xl h-16 rounded-lg shadow-inner"
                                autoFocus
                            />
                        </FormControl>
                        <FormMessage className="text-center" />
                    </FormItem>
                )}
            />
        </form>
      </Form>
      
      {getDescription(question) && <p className="text-center text-sm text-muted-foreground mt-8">{getDescription(question)}</p>}
    </div>
  );
};

export default Weight;
