'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Diet } from '@/lib/quiz-data';

const dietOptions = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarian', label: 'Pescetarian' },
] as const;

const DietStep = () => {
  const { control } = useFormContext<Diet>();

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">Your Diet</CardTitle>
        <CardDescription>How would you describe your eating habits?</CardDescription>
      </CardHeader>

      <div className="space-y-8">
        <FormField
          control={control}
          name="diet"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg">Dietary Preference</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                  aria-label="Dietary Preference"
                >
                  {dietOptions.map((option) => (
                    <FormItem key={option.value}>
                       <FormControl>
                         <RadioGroupItem value={option.value} id={option.value} className="sr-only" aria-labelledby={`${option.value}-label`} />
                      </FormControl>
                      <FormLabel htmlFor={option.value} id={`${option.value}-label`} className={cn(
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
          name="dislikes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-lg flex items-center gap-2">
                Food Dislikes (optional)
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" aria-label="More information about food dislikes">
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p className="text-sm">List any foods you dislike so we can avoid recommending them. e.g., cilantro, mushrooms</p>
                  </PopoverContent>
                </Popover>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us what you don't like to eat..." {...field} className="h-24" aria-label="Food dislikes" />
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

export default DietStep;
