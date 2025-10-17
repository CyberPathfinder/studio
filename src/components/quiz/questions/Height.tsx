
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { getLabel, getDescription } from '@/lib/i18n';
import { useAnalytics } from '@/hooks/use-analytics';

const Height = ({ question }: { question: Question }) => {
  const { state, dispatch } = useQuizEngine();
  const { track } = useAnalytics();
  
  const { 
    unitHeight = 'metric', 
    heightCmView, 
    heightFtView, 
    heightInView 
  } = state.answers.body || {};


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

      <div className="space-y-4">
        {unitHeight === 'metric' ? (
          <div className="max-w-xs mx-auto">
            <Label htmlFor={`${question.id}-cm`} className="sr-only">Рост (см)</Label>
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
          </div>
        ) : (
          <div className="flex items-start gap-4 justify-center">
            <div className="w-1/2 max-w-xs">
              <Label htmlFor={`${question.id}-ft`} className="ml-2">Футы</Label>
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
            </div>
            <div className="w-1/2 max-w-xs">
              <Label htmlFor={`${question.id}-in`} className="ml-2">Дюймы</Label>
              <Input
                id={`${question.id}-in`}
                type="number"
                inputMode='decimal'
                value={heightInView}
                onChange={(e) => handleViewChange('heightInView', e.target.value)}
                placeholder="9"
                className="text-center text-xl h-16 mt-1 rounded-lg shadow-inner"
              />
            </div>
          </div>
        )}
      </div>
      
       <p className="text-center text-sm text-muted-foreground mt-8">Можно переключать единицы — значения конвертируются автоматически.</p>
    </div>
  );
};

export default Height;
