'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { convertWeight, roundToTwo } from '@/lib/unit-conversion';

const HeightWeight = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const { toast } = useToast();
  
  const answer = state.answers[question.id] || {};
  const { height, weight, weight_unit = 'kg' } = answer;

  const [displayWeight, setDisplayWeight] = useState<string>(weight?.toString() || '');
  
  useEffect(() => {
    const numericValue = parseFloat(weight);
    if (!isNaN(numericValue)) {
        if (weight_unit === 'lb') {
            setDisplayWeight(roundToTwo(convertWeight(numericValue, 'kg', 'lb')).toString());
        } else {
            setDisplayWeight(roundToTwo(numericValue).toString());
        }
    } else {
        setDisplayWeight('');
    }
  }, [weight, weight_unit]);


  const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAnswerChange(question.id, { ...answer, height: e.target.value }, question.analytics_key);
  };

  const onWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setDisplayWeight(displayValue);
    
    const numericValue = parseFloat(displayValue);
    let newWeightInKg = 0;
    if (!isNaN(numericValue)) {
        newWeightInKg = weight_unit === 'lb' ? convertWeight(numericValue, 'lb', 'kg') : numericValue;
    }
    
    // Soft validation
    const min = question.validation?.min || 35;
    const max = question.validation?.max || 300;
    if (newWeightInKg > 0 && (newWeightInKg < min || newWeightInKg > max)) {
        toast({
            title: 'Unusual Weight',
            description: `The weight seems unusual. Please double-check if it's correct.`
        });
    }

    handleAnswerChange(question.id, { ...answer, weight: newWeightInKg }, question.analytics_key);
  };

  const onUnitChange = (newUnit: 'kg' | 'lb') => {
    handleAnswerChange(question.id, { ...answer, weight_unit: newUnit }, question.analytics_key);
  };


  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{question.i18n.en.label}</CardTitle>
        {question.i18n.en.description && <CardDescription>{question.i18n.en.description}</CardDescription>}
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <Label htmlFor={`${question.id}-height`} className="font-bold text-lg">Height (cm)</Label>
          <Input
            id={`${question.id}-height`}
            type="number"
            value={height || ''}
            onChange={onHeightChange}
            placeholder="e.g., 175"
            className="text-center text-lg h-12 mt-2"
          />
        </div>
        <div>
          <Label className="font-bold text-lg">Weight</Label>
           <div className="flex items-center gap-2 mt-2">
            <Input
              id={`${question.id}-weight`}
              type="number"
              value={displayWeight}
              onChange={onWeightInputChange}
              placeholder={weight_unit === 'kg' ? 'e.g., 70' : 'e.g., 154'}
              className="text-center text-lg h-12"
            />
            <RadioGroup
              value={weight_unit}
              onValueChange={onUnitChange}
              className="flex rounded-md border p-1"
            >
              <RadioGroupItem value="kg" id="kg" className="sr-only" />
              <Label htmlFor="kg" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", weight_unit === 'kg' && "bg-muted font-semibold")}>kg</Label>
              <RadioGroupItem value="lb" id="lb" className="sr-only" />
              <Label htmlFor="lb" className={cn("px-3 py-1.5 rounded-md text-sm cursor-pointer", weight_unit === 'lb' && "bg-muted font-semibold")}>lb</Label>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeightWeight;
