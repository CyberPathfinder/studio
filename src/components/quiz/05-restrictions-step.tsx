'use client';

import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
import { Restrictions } from '@/lib/quiz-data';

const restrictionOptions = [
  { id: 'lactose', label: 'Lactose Intolerance' },
  { id: 'gluten', label: 'Gluten Intolerance' },
  { id: 'nuts', label: 'Nut Allergy' },
] as const;

const RestrictionsStep = () => {
  const { control, watch } = useFormContext<Restrictions>();
  const showOtherField = watch('restrictions.other');

  return (
    <div className="w-full">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">Any Restrictions?</CardTitle>
        <CardDescription>Select any dietary restrictions you have.</CardDescription>
      </CardHeader>

      <div className="space-y-6">
        <FormField
          control={control}
          name="restrictions"
          render={() => (
            <FormItem>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restrictionOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={control}
                    name={`restrictions.${item.id}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id={`restriction-${item.id}`}
                            aria-labelledby={`restriction-${item.id}-label`}
                          />
                        </FormControl>
                        <FormLabel id={`restriction-${item.id}-label`} className="font-normal w-full cursor-pointer">
                          {item.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
                 <FormField
                    key="other"
                    control={control}
                    name="restrictions.other"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="restriction-other"
                            aria-labelledby="restriction-other-label"
                          />
                        </FormControl>
                        <FormLabel id="restriction-other-label" className="font-normal w-full cursor-pointer">
                          Other
                        </FormLabel>
                      </FormItem>
                    )}
                  />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {showOtherField && (
           <FormField
            control={control}
            name="restrictions.other_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-lg flex items-center gap-2">
                  Please specify
                  <Popover>
                    <PopoverTrigger asChild>
                       <button type="button" aria-label="More information about other restrictions">
                        <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <p className="text-sm">List any other allergies or restrictions. e.g., Soy allergy, nightshades</p>
                    </PopoverContent>
                  </Popover>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Soy allergy" {...field} aria-label="Other dietary restrictions" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default RestrictionsStep;
