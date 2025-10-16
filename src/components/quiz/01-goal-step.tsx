'use client';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Dumbbell, Scale, Target } from 'lucide-react';
import { Goal } from '@/lib/quiz-data';

const goals = [
  { value: 'lose_weight', label: 'Lose Weight', icon: <Scale className="h-8 w-8 mb-2" /> },
  { value: 'maintain_weight', label: 'Maintain Weight', icon: <Target className="h-8 w-8 mb-2" /> },
  { value: 'gain_muscle', label: 'Gain Muscle', icon: <Dumbbell className="h-8 w-8 mb-2" /> },
] as const;

const GoalStep = () => {
  const { control, watch } = useFormContext<Goal>();
  const selectedGoal = watch('goal');

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">What is your primary goal?</CardTitle>
        <CardDescription>This helps us tailor your plan.</CardDescription>
      </CardHeader>
      
      <FormField
        control={control}
        name="goal"
        render={({ field }) => (
          <FormItem className="space-y-4">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                aria-label="Primary Goal"
              >
                {goals.map((goal) => (
                  <FormItem key={goal.value}>
                    <FormControl>
                      <RadioGroupItem value={goal.value} id={goal.value} className="sr-only" aria-labelledby={`${goal.value}-label`} />
                    </FormControl>
                    <FormLabel
                      htmlFor={goal.value}
                      id={`${goal.value}-label`}
                      className={cn(
                        'flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all',
                        field.value === goal.value && 'border-primary shadow-lg'
                      )}
                    >
                      {goal.icon}
                      <span className="font-bold">{goal.label}</span>
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

export default GoalStep;
