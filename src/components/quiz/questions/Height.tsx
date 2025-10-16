
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
import { convertCmToFtIn, convertFtInToCm, roundToTwo } from '@/lib/unit-conversion';
import { getLabel, getDescription, getHint } from '@/lib/i18n';

const Height = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const { toast } = useToast();
  
  // The value is always stored in cm in the state
  const heightInCm = state.answers[question.id];
  const [unit, setUnit] = useState<'cm' | 'ft_in'>('cm');

  const [cmValue, setCmValue] = useState<string>(heightInCm ? roundToTwo(heightInCm).toString() : '');
  const [ftValue, setFtValue] = useState<string>('');
  const [inValue, setInValue] = useState<string>('');

  useEffect(() => {
    if (heightInCm) {
        const { feet, inches } = convertCmToFtIn(heightInCm);
        setFtValue(feet.toString());
        setInValue(inches.toString());
        setCmValue(roundToTwo(heightInCm).toString());
    } else {
        setCmValue('');
        setFtValue('');
        setInValue('');
    }
  }, [heightInCm]);

  const onCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCmValue(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
        handleAnswerChange(question.id, numericValue, question.analytics_key);
    } else {
        handleAnswerChange(question.id, null, question.analytics_key);
    }
  };

  const onFtInChange = (part: 'ft' | 'in', value: string) => {
    const newFt = part === 'ft' ? value : ftValue;
    const newIn = part === 'in' ? value : inValue;
    
    setFtValue(newFt);
    setInValue(newIn);

    const feet = parseFloat(newFt);
    const inches = parseFloat(newIn);

    if (!isNaN(feet) || !isNaN(inches)) {
        const newCm = convertFtInToCm(feet || 0, inches || 0);
        handleAnswerChange(question.id, newCm, question.analytics_key);
    } else {
        handleAnswerChange(question.id, null, question.analytics_key);
    }
  }

  const handleUnitChange = (newUnit: 'cm' | 'ft_in') => {
      setUnit(newUnit);
  }

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>

       <div className='flex justify-center mb-4'>
            <RadioGroup
              value={unit}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1"
            >
              <RadioGroupItem value="cm" id="cm" className="sr-only" />
              <Label htmlFor="cm" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unit === 'cm' && "bg-muted font-semibold")}>cm</Label>
              <RadioGroupItem value="ft_in" id="ft_in" className="sr-only" />
              <Label htmlFor="ft_in" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unit === 'ft_in' && "bg-muted font-semibold")}>ft, in</Label>
            </RadioGroup>
      </div>

      {unit === 'cm' ? (
        <div>
          <Label htmlFor={`${question.id}-cm`} className="sr-only">Height in cm</Label>
          <Input
            id={`${question.id}-cm`}
            type="number"
            value={cmValue}
            onChange={onCmChange}
            placeholder="e.g., 175"
            className="text-center text-lg h-12 mt-2 max-w-xs mx-auto"
          />
        </div>
      ) : (
        <div className="flex items-center gap-4 justify-center">
          <div>
            <Label htmlFor={`${question.id}-ft`}>Feet</Label>
            <Input
              id={`${question.id}-ft`}
              type="number"
              value={ftValue}
              onChange={(e) => onFtInChange('ft', e.target.value)}
              placeholder="e.g., 5"
              className="text-center text-lg h-12 mt-2"
            />
          </div>
          <div>
            <Label htmlFor={`${question.id}-in`}>Inches</Label>
            <Input
              id={`${question.id}-in`}
              type="number"
              value={inValue}
              onChange={(e) => onFtInChange('in', e.target.value)}
              placeholder="e.g., 9"
              className="text-center text-lg h-12 mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Height;
