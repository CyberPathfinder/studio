
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { convertWeight, roundToTwo } from '@/lib/unit-conversion';
import { getLabel, getDescription } from '@/lib/i18n';
import { useDebouncedCallback } from 'use-debounce';

const Weight = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const { toast } = useToast();
  
  // This component will manage its own unit state but save the canonical value (kg) to the engine
  const weightInKg = state.answers[question.id];
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [displayWeight, setDisplayWeight] = useState<string>('');
  
  useEffect(() => {
    const numericValue = parseFloat(weightInKg);
    if (!isNaN(numericValue)) {
        if (unit === 'lb') {
            setDisplayWeight(roundToTwo(convertWeight(numericValue, 'kg', 'lb')).toString());
        } else {
            setDisplayWeight(roundToTwo(numericValue).toString());
        }
    } else {
        setDisplayWeight('');
    }
  }, [weightInKg, unit]);

  const showAmbitiousGoalToast = useDebouncedCallback(() => {
    toast({
        title: 'Ambitious Goal',
        description: `This is an ambitious goal, but we'll help you pace it safely.`,
    });
  }, 1000);


  const onWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setDisplayWeight(displayValue);
    
    const numericValue = parseFloat(displayValue);
    let newWeightInKg = 0;
    if (!isNaN(numericValue)) {
        newWeightInKg = unit === 'lb' ? convertWeight(numericValue, 'lb', 'kg') : numericValue;
        
        // Soft validation for weight range
        const min = question.validation?.min || 35;
        const max = question.validation?.max || 300;
        if (newWeightInKg > 0 && (newWeightInKg < min || newWeightInKg > max)) {
            toast({
                title: 'Unusual Weight',
                description: `The weight seems unusual. Please double-check if it's correct.`
            });
        }
        
    }
    
    handleAnswerChange(question.id, isNaN(numericValue) ? null : newWeightInKg, question.analytics_key);
  };

  const onUnitChange = (newUnit: 'kg' | 'lb') => {
    setUnit(newUnit);
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
              value={displayWeight}
              onChange={onWeightInputChange}
              placeholder={unit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
              className="text-center text-lg h-12"
            />
            <RadioGroup
              value={unit}
              onValueChange={onUnitChange}
              className="flex rounded-md border p-1"
            >
              <RadioGroupItem value="kg" id="kg" className="sr-only" />
              <Label htmlFor="kg" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", unit === 'kg' && "bg-muted font-semibold")}>kg</Label>
              <RadioGroupItem value="lb" id="lb" className="sr-only" />
              <Label htmlFor="lb" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", unit === 'lb' && "bg-muted font-semibold")}>lb</Label>
            </RadioGroup>
        </div>
    </div>
  );
};

export default Weight;
