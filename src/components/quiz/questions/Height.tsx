
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { getLabel, getDescription } from '@/lib/i18n';

const Height = ({ question }: { question: Question }) => {
  const { state, dispatch } = useQuizEngine();
  
  const { 
    unitHeight = 'metric', 
    heightCmView = '', 
    heightFtView = '', 
    heightInView = '' 
  } = state.answers.body || {};

  const handleUnitChange = (newUnit: 'metric' | 'imperial') => {
    dispatch({ type: 'SET_BODY_UNIT', payload: { unitType: 'height', unit: newUnit } });
  }

  const handleViewChange = (field: 'heightCmView' | 'heightFtView' | 'heightInView', value: string) => {
    dispatch({ type: 'SET_BODY_VIEW_FIELD', payload: { field, value }});
  }

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>

       <div className='flex justify-center mb-4'>
            <RadioGroup
              value={unitHeight}
              onValueChange={handleUnitChange}
              className="flex rounded-md border p-1"
            >
              <RadioGroupItem value="metric" id="cm" className="sr-only" />
              <Label htmlFor="cm" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitHeight === 'metric' && "bg-muted font-semibold")}>cm</Label>
              <RadioGroupItem value="imperial" id="ft_in" className="sr-only" />
              <Label htmlFor="ft_in" className={cn("px-4 py-2 rounded-md text-base cursor-pointer", unitHeight === 'imperial' && "bg-muted font-semibold")}>ft, in</Label>
            </RadioGroup>
      </div>

      {unitHeight === 'metric' ? (
        <div>
          <Label htmlFor={`${question.id}-cm`} className="sr-only">Height in cm</Label>
          <Input
            id={`${question.id}-cm`}
            type="number"
            inputMode='decimal'
            value={heightCmView}
            onChange={(e) => handleViewChange('heightCmView', e.target.value)}
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
              inputMode='decimal'
              value={heightFtView}
              onChange={(e) => handleViewChange('heightFtView', e.target.value)}
              placeholder="e.g., 5"
              className="text-center text-lg h-12 mt-2"
            />
          </div>
          <div>
            <Label htmlFor={`${question.id}-in`}>Inches</Label>
            <Input
              id={`${question.id}-in`}
              type="number"
              inputMode='decimal'
              value={heightInView}
              onChange={(e) => handleViewChange('heightInView', e.target.value)}
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
