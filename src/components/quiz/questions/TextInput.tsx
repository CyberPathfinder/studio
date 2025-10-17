

'use client';
import { useEffect } from 'react';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { getLabel, getDescription, getHint } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const TextInput = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const { toast } = useToast();
  const answer = state.answers[question.id];

  const FormSchema = z.object({
    value: z.string()
      .min(question.validation?.minLength ?? 0, { message: `Must be at least ${question.validation?.minLength} characters.`})
      .max(question.validation?.maxLength ?? 1000, { message: `Must be no more than ${question.validation?.maxLength} characters.`})
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      value: answer || '',
    },
  });

  const { formState: { errors } } = form;

   useEffect(() => {
    if (errors.value?.message) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: errors.value.message,
        })
    }
  },[errors.value, toast])

  const description = getDescription(question);
  const hint = getHint(question);

  return (
    <div className="w-full max-w-md mx-auto">
       <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onChange={form.handleSubmit((data) => handleAnswerChange(question.id, data.value, question.analytics_key))} className="space-y-4">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-center">
                    <FormLabel htmlFor={question.id} className="text-xl sr-only">{getLabel(question)}</FormLabel>
                    {description && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-pointer" />
                            </PopoverTrigger>
                            <PopoverContent>
                                <p className="text-sm">{description}</p>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <FormControl>
                    <Input
                        id={question.id}
                        type="text"
                        placeholder={hint || ''}
                        className="h-12 text-lg text-center"
                        {...field}
                        value={field.value ?? ''}
                    />
                </FormControl>
                <div className="h-5">
                    <FormMessage className={cn(hint && "hidden")}/>
                    {hint && <p className={cn("text-sm text-muted-foreground text-center", errors.value && "text-destructive")}>{errors.value ? errors.value.message : hint}</p>}
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default TextInput;
