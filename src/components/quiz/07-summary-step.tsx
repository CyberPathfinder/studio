'use client';
import { useForm, useFormContext } from 'react-hook-form';
import { useQuiz } from '@/hooks/use-quiz';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAnalytics } from '@/hooks/use-analytics';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase/provider';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ScrollArea } from '../ui/scroll-area';
import { roundToTwo } from '@/lib/unit-conversion';

const SignUpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions.' }),
  }),
});

type SignUpForm = z.infer<typeof SignUpSchema>;

const SummaryDisplay = ({ label, value, step }: { label: string; value: string; step: number }) => {
  const { goToStep } = useQuiz();
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
      <Button variant="link" size="sm" onClick={() => goToStep(step)}>Edit</Button>
    </div>
  );
};

const SummaryStep = () => {
  const { getValues } = useQuiz();
  const { track } = useAnalytics();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const quizData = getValues();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { email: '', password: '', consent: false },
  });

  const onSubmit = async (data: SignUpForm) => {
    track('sign_up_attempt');
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase not initialized.' });
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        track('sign_up_success', { uid: user.uid });
        
        const intakeData = {
            ...quizData,
            createdAt: new Date().toISOString(),
            userId: user.uid,
        };

        const intakeRef = doc(collection(firestore, `users/${user.uid}/intake`), 'initial');
        addDocumentNonBlocking(intakeRef.parent, intakeData);

        track('intake_saved');
        toast({ title: 'Success!', description: 'Your account has been created and your plan is ready.' });
        // TODO: Redirect to dashboard
    } catch (error: any) {
        console.error(error);
        const message = error.code === 'auth/email-already-in-use' 
            ? 'This email is already in use.' 
            : 'An error occurred. Please try again.';
        toast({ variant: 'destructive', title: 'Sign Up Failed', description: message });
    }
  };
  
  const dietRestrictions = Object.entries(quizData.restrictions)
    .filter(([, value]) => !!value && typeof value === 'boolean')
    .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(', ') || 'None';
    
  const weightDisplay = quizData.weight && quizData.weight_unit 
    ? `${roundToTwo(quizData.weight)} kg` 
    : '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <CardHeader className="text-center p-0 mb-4">
          <CardTitle className="font-headline text-2xl">Confirm Your Plan</CardTitle>
        </CardHeader>
        <Card>
          <ScrollArea className="h-[23rem]">
            <CardContent className="p-4 space-y-2">
                <SummaryDisplay label="Goal" value={quizData.goal || ''} step={1} />
                <Separator />
                <SummaryDisplay label="Sex" value={quizData.sex || ''} step={2} />
                <SummaryDisplay label="Age" value={quizData.age?.toString() || ''} step={2} />
                <Separator />
                <SummaryDisplay label="Height" value={`${quizData.height} cm`} step={3} />
                <SummaryDisplay label="Weight" value={weightDisplay} step={3} />
                <Separator />
                <SummaryDisplay label="Diet" value={quizData.diet || ''} step={4} />
                {quizData.dislikes && <SummaryDisplay label="Dislikes" value={quizData.dislikes} step={4} />}
                <Separator />
                <SummaryDisplay label="Restrictions" value={dietRestrictions} step={5} />
                {quizData.restrictions.other_text && <SummaryDisplay label="Other" value={quizData.restrictions.other_text} step={5} />}
                <Separator />
                <SummaryDisplay label="Activity Level" value={quizData.activity_level?.replace('_', ' ') || ''} step={6} />
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
      <div>
        <CardHeader className="text-center p-0 mb-4">
          <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
        </CardHeader>
        <Card>
            <CardContent className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="consent" render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                           <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">I agree to the terms and conditions.</FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? 'Creating Account...' : 'Save & Continue'}
                    </Button>
                    </form>
                </Form>
                 <Button variant="link" className="w-full mt-2 text-muted-foreground" disabled>Continue without account</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SummaryStep;
