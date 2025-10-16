'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { Activity } from '@/lib/quiz-data';

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise/sports 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise/sports 3-5 days/week' },
  { value: 'active', label: 'Very Active', description: 'Hard exercise/sports 6-7 days a week' },
  { value: 'very_active', label: 'Extra Active', description: 'Very hard exercise & physical job' },
] as const;

const ActivityStep = () => {
  const { control } = useFormContext<Activity>();

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">Your Activity Level</CardTitle>
        <CardDescription>Which of these best describes your daily activity?</CardDescription>
      </CardHeader>

      <FormField
        control={control}
        name="activity_level"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-3"
                aria-label="Activity Level"
              >
                {activityLevels.map((level) => (
                  <FormItem key={level.value} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={level.value} id={level.value} aria-labelledby={`${level.value}-label`} />
                    </FormControl>
                    <FormLabel id={`${level.value}-label`} className="font-normal w-full cursor-pointer flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{level.label}</span>
                        <p className="text-xs text-muted-foreground">{level.description}</p>
                      </div>
                       <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" onClick={(e) => e.preventDefault()} aria-label={`More info about ${level.label} activity level`}>
                            <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="end">
                          <p className="text-sm">{level.description}.</p>
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
             <div className="text-center h-4">
                <FormMessage />
              </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ActivityStep;
