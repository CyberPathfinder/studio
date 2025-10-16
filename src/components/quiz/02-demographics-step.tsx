'use client';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Demographics } from '@/lib/quiz-data';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const sexOptions = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
] as const;

const ageRange = { min: 13, max: 120 };

const DemographicsStep = () => {
  const { control, watch, formState: { errors } } = useFormContext<Demographics>();
  const { toast } = useToast();
  const age = watch('age');
  const selectedSex = watch('sex');

  useEffect(() => {
    if (age && (age < ageRange.min || age > ageRange.max)) {
      const { id, dismiss } = toast({
        variant: 'destructive',
        title: 'Age Recommendation',
        description: `VivaForm is intended for users between ${ageRange.min} and ${ageRange.max} years old.`,
      });
      const timer = setTimeout(() => dismiss(id), 5000);
      return () => clearTimeout(timer);
    }
  }, [age, toast]);


  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">Tell us about yourself</CardTitle>
        <CardDescription>This information helps us calculate your nutritional needs.</CardDescription>
      </CardHeader>

      <div className="space-y-8">
        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Biological Sex</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  {sexOptions.map((option) => (
                    <FormItem key={option.value}>
                       <FormControl>
                         <RadioGroupItem value={option.value} className="sr-only" />
                      </FormControl>
                      <FormLabel className={cn(
                        "flex h-12 items-center justify-center rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                        field.value === option.value && "border-primary"
                      )}>
                        {option.label}
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

        <FormField
          control={control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg flex items-center gap-2">
                Age
                <Popover>
                  <PopoverTrigger>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Your age helps us estimate your metabolic rate. We recommend our app for ages 13-120.</p>
                  </PopoverContent>
                </Popover>
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter your age" {...field} className="text-center text-lg h-12" />
              </FormControl>
              <div className="text-center h-4">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default DemographicsStep;
