
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { getLabel, getDescription } from '@/lib/i18n';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

const Height = ({ question }: { question: Question }) => {
  const { state, dispatch } = useQuizEngine();
  const { track } = useAnalytics();
  
  const { 
    unitHeight = 'metric', 
    heightCm,
    heightCmView, 
    heightFtView, 
    heightInView 
  } = state.answers.body || {};

  // Zod schema for validation
  const formSchema = z.object({
    heightCm: z.number().min(120, "Рост должен быть не менее 120 см").max(230, "Рост должен быть не более 230 см"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: { heightCm: heightCm ?? 0 }, // Form expects a number
  });

  // Re-validate when canonical value changes
  useEffect(() => {
    form.setValue('heightCm', heightCm ?? 0, { shouldValidate: true });
  }, [heightCm, form]);


  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    track('quiz_unit_change', { field: 'height', unit: newUnit });
    dispatch({ type: 'SET_BODY_UNIT', payload: { unitType: 'height', unit: newUnit } });
  }

  const handleViewChange = (field: 'heightCmView' | 'heightFtView' | 'heightInView', value: string) => {
    dispatch({ type: 'SET_BODY_VIEW_FIELD', payload: { field, value, analyticsKey: question.analytics_key }});
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question, 'ru')}</CardTitle>
        {getDescription(question) && <CardDescription className="mt-2">{getDescription(question)}</CardDescription>}
      </CardHeader>

       <div className='flex justify-center mb-8'>
            <RadioGroup
              value={unitHeight}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1 bg-muted/50"
            >
              <RadioGroupItem value="metric" id="cm" className="sr-only" />
              <Label htmlFor="cm" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitHeight === 'metric' && "bg-background font-semibold shadow-sm")}>Сантиметры</Label>
              <RadioGroupItem value="imperial" id="ft_in" className="sr-only" />
              <Label htmlFor="ft_in" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitHeight === 'imperial' && "bg-background font-semibold shadow-sm")}>Футы и дюймы</Label>
            </RadioGroup>
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <FormField
              control={form.control}
              name="heightCm"
              render={() => (
                <FormItem>
                  {unitHeight === 'metric' ? (
                    <div className="max-w-xs mx-auto">
                      <Label htmlFor={`${question.id}-cm`} className="sr-only">Рост (см)</Label>
                      <FormControl>
                        <Input
                          id={`${question.id}-cm`}
                          type="number"
                          inputMode='decimal'
                          value={heightCmView}
                          onChange={(e) => handleViewChange('heightCmView', e.target.value)}
                          placeholder="Например, 175"
                          className="text-center text-xl h-16 rounded-lg shadow-inner"
                          autoFocus
                        />
                      </FormControl>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 justify-center">
                      <div className="w-1/2 max-w-xs">
                        <Label htmlFor={`${question.id}-ft`} className="ml-2">Футы</Label>
                        <FormControl>
                          <Input
                            id={`${question.id}-ft`}
                            type="number"
                            inputMode='decimal'
                            value={heightFtView}
                            onChange={(e) => handleViewChange('heightFtView', e.target.value)}
                            placeholder="5"
                            className="text-center text-xl h-16 mt-1 rounded-lg shadow-inner"
                             autoFocus
                          />
                        </FormControl>
                      </div>
                      <div className="w-1/2 max-w-xs">
                        <Label htmlFor={`${question.id}-in`} className="ml-2">Дюймы</Label>
                        <FormControl>
                          <Input
                            id={`${question.id}-in`}
                            type="number"
                            inputMode='decimal'
                            value={heightInView}
                            onChange={(e) => handleViewChange('heightInView', e.target.value)}
                            placeholder="9"
                            className="text-center text-xl h-16 mt-1 rounded-lg shadow-inner"
                          />
                        </FormControl>
                      </div>
                    </div>
                  )}
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
        </form>
      </Form>
      
       <p className="text-center text-sm text-muted-foreground mt-8">Можно переключать единицы — значения конвертируются автоматически.</p>
    </div>
  );
};

export default Height;
