'use client';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { Measurements } from '@/lib/quiz-data';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { cn } from '@/lib/utils';
import { convertWeight, roundToTwo } from '@/lib/unit-conversion';

const heightRange = { min: 100, max: 250 }; // cm
const weightRangeKg = { min: 35, max: 300 };
const weightRangeLb = { min: 80, max: 660 };

const MeasurementsStep = () => {
  const { control, setValue, getValues } = useFormContext<Measurements>();
  const { toast } = useToast();

  const [height, weight, weight_unit] = useWatch({
    control,
    name: ['height', 'weight', 'weight_unit'],
  });

  // Local state for the input field to display converted values
  const [displayWeight, setDisplayWeight] = useState<string>(getValues('weight')?.toString() || '');
  
  // Update display weight when unit changes
  useEffect(() => {
    const currentWeightKg = getValues('weight') || 0;
    if (weight_unit === 'lb') {
      setDisplayWeight(roundToTwo(convertWeight(currentWeightKg, 'kg', 'lb')).toString());
    } else {
      setDisplayWeight(roundToTwo(currentWeightKg).toString());
    }
  }, [weight_unit, getValues]);


  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const displayValue = e.target.value;
    setDisplayWeight(displayValue);
    
    const numericValue = parseFloat(displayValue);
    if (!isNaN(numericValue)) {
      if (weight_unit === 'lb') {
        setValue('weight', convertWeight(numericValue, 'lb', 'kg'), { shouldValidate: true });
      } else {
        setValue('weight', numericValue, { shouldValidate: true });
      }
    } else {
       setValue('weight', 0, { shouldValidate: true });
    }
  };

  // Validation effects
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
    const range = weight_unit === 'kg' ? weightRangeKg : weightRangeLb;
    const currentDisplayWeight = parseFloat(displayWeight);
    if (displayWeight && (currentDisplayWeight < range.min || currentDisplayWeight > range.max)) {
      const { id, dismiss } = toast({
        variant: 'destructive',
        title: 'Weight Unlikely',
        description: `Are you sure about your weight in ${weight_unit}? Feel free to proceed if it is correct.`,
      });
      const timer = setTimeout(() => dismiss(id), 5000);
      return () => clearTimeout(timer);
    }
  }, [weight_unit, displayWeight, toast]);


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
                <FormMessage name='height' />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="weight"
          render={() => (
            <FormItem>
                <FormLabel className="font-bold text-lg flex items-center gap-2">
                    Weight
                </FormLabel>
                <div className="flex items-center gap-2">
                    <FormControl>
                        <Input 
                            type="number" 
                            placeholder={weight_unit === 'kg' ? 'e.g., 70' : 'e.g., 154'} 
                            value={displayWeight}
                            onChange={handleWeightChange}
                            className="text-center text-lg h-12" 
                            aria-label={`Weight in ${weight_unit}`} 
                        />
                    </FormControl>
                    <FormField
                      control={control}
                      name="weight_unit"
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            const currentWeightInKg = getValues('weight') || 0;
                            const newDisplayWeight = value === 'lb'
                              ? roundToTwo(convertWeight(currentWeightInKg, 'kg', 'lb'))
                              : roundToTwo(currentWeightInKg);
                            setDisplayWeight(newDisplayWeight.toString());
                          }}
                          value={field.value}
                          className="flex rounded-md border p-1"
                        >
                          <RadioGroupItem value="kg" id="kg" className="sr-only" />
                          <FormLabel htmlFor="kg" className={cn(
                            "px-3 py-1.5 rounded-md text-sm cursor-pointer",
                            field.value === 'kg' && "bg-muted font-semibold"
                          )}>kg</FormLabel>
                          
                          <RadioGroupItem value="lb" id="lb" className="sr-only" />
                           <FormLabel htmlFor="lb" className={cn(
                            "px-3 py-1.5 rounded-md text-sm cursor-pointer",
                            field.value === 'lb' && "bg-muted font-semibold"
                          )}>lb</FormLabel>
                        </RadioGroup>
                      )}
                    />
                </div>
               <div className="text-center h-4">
                <FormMessage name='weight' />
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default MeasurementsStep;
