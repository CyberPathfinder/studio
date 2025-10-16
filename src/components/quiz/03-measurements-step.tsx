'use client';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { Measurements } from '@/lib/quiz-data';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const heightRange = { min: 100, max: 250 };
const weightRange = { min: 35, max: 300 };

const MeasurementsStep = () => {
  const { control, watch } = useFormContext<Measurements>();
  const { toast } = useToast();
  const height = watch('height');
  const weight = watch('weight');

  useEffect(() => {
    if (height && (height < heightRange.min || height > heightRange.max)) {
      const { id, dismiss } = toast({
        variant: 'destructive',
        title: 'Height Unlikely',
        description: `Are you sure about your height? Feel free to proceed if it is correct.`,
      });
       const timer = setTimeout(() => dismiss(id), 5000);
       return () => clearTimeout(timer);
    }
  }, [height, toast]);

  useEffect(() => {
    if (weight && (weight < weightRange.min || weight > weightRange.max)) {
      const { id, dismiss } = toast({
        variant: 'destructive',
        title: 'Weight Unlikely',
        description: `Are you sure about your weight? Feel free to proceed if it is correct.`,
      });
      const timer = setTimeout(() => dismiss(id), 5000);
      return () => clearTimeout(timer);
    }
  }, [weight, toast]);

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">Your Measurements</CardTitle>
        <CardDescription>This helps us understand your body composition.</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg flex items-center gap-2">
                Height (cm)
                <Popover>
                  <PopoverTrigger asChild>
                     <button type="button" aria-label="More information about height input">
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Please provide your height in centimeters.</p>
                  </PopoverContent>
                </Popover>
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 175" {...field} className="text-center text-lg h-12" aria-label="Height in centimeters" />
              </FormControl>
               <div className="text-center h-4">
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg flex items-center gap-2">
                Weight (kg)
                 <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" aria-label="More information about weight input">
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">Please provide your current weight in kilograms.</p>
                  </PopoverContent>
                </Popover>
              </FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 70" {...field} className="text-center text-lg h-12" aria-label="Weight in kilograms" />
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

export default MeasurementsStep;
