
'use client';
import { useState } from 'react';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { useFirebase } from '@/firebase';
import { useAnalytics } from '@/hooks/use-analytics';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Edit, Loader2 } from 'lucide-react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getLabel } from '@/lib/i18n';
import { convertCmToFtIn, convertWeight, roundToTwo } from '@/lib/unit-conversion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { loadStripe } from '@stripe/stripe-js';
import SmartFeedbackCard from '../dashboard/SmartFeedbackCard';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const signUpSchema = z.object({
  email: z.string().email({ message: 'Пожалуйста, введите корректный email.' }),
  password: z.string().min(8, { message: 'Пароль должен содержать не менее 8 символов.' }),
  consent: z.boolean().refine(val => val === true, { message: 'Вы должны согласиться с условиями.' }),
});

const QuizSummary = () => {
  const { state, jumpToQuestion, submitQuiz } = useQuizEngine();
  const { user, isUserLoading } = useFirebase();
  const { track } = useAnalytics();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      consent: false,
    },
  });

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    track('sign_up_attempt');

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;
      
      track('sign_up_success', { uid: newUser.uid, method: 'password' });
      toast({
        title: 'Аккаунт создан!',
        description: 'Ваш аккаунт был успешно создан.',
      });

      await submitQuiz(newUser.uid);
      setIsPlanSaved(true);
      toast({
        title: 'Успешно!',
        description: 'Ваш персональный план сохранен.',
      });
      
    } catch (error: any) {
      track('sign_up_failure', { error: error.message });
      if (error.code === 'auth/email-already-in-use') {
        form.setError('email', { type: 'manual', message: 'Этот адрес электронной почты уже используется.'});
      } else {
        form.setError('root', { type: 'manual', message: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoPremium = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to purchase a plan.",
      });
      return;
    }
    setIsLoading(true);
    track('checkout_start', { planId: 'premium_monthly' });
    try {
      const res = await fetch('/api/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, planId: 'premium_monthly', intakeVersion: 'v1' }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create checkout session.');
      }

      const { sessionId } = await res.json();
      if (!sessionId) {
        throw new Error('Failed to retrieve checkout session ID.');
      }
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js has not loaded yet.');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not proceed to checkout.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSaveAndContinue = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await submitQuiz(user.uid);
      setIsPlanSaved(true);
      toast({ title: "Успешно!", description: "Ваш план был сохранен."})
    } catch (error) {
       toast({ variant: "destructive", title: "Ошибка", "description": "Не удалось сохранить ваш план."})
    } finally {
        setIsLoading(false);
    }
  }


  const { body, diet_style, name, age } = state.answers;
  const { heightCm, weightKg, goalWeightKg, unitHeight, unitWeight } = body || {};
  const bmi = state.answers.bmi_calc;

  const displayHeight = unitHeight === 'metric' 
    ? `${roundToTwo(heightCm || 0)} cm`
    : `${convertCmToFtIn(heightCm).feet} ft ${convertCmToFtIn(heightCm).inches} in`;
  
  const displayWeight = unitWeight === 'metric'
    ? `${roundToTwo(weightKg || 0)} kg`
    : `${roundToTwo(convertWeight(weightKg || 0, 'kg', 'lb'))} lb`;
    
  const displayGoalWeight = goalWeightKg ? (unitWeight === 'metric'
    ? `${roundToTwo(goalWeightKg || 0)} kg`
    : `${roundToTwo(convertWeight(goalWeightKg || 0, 'kg', 'lb'))} lb`) : 'Not set';


  const summaryItems = [
      { id: 'height', label: 'Рост', value: displayHeight },
      { id: 'weight', label: 'Текущий вес', value: displayWeight },
      { id: 'goal_weight', label: 'Целевой вес', value: displayGoalWeight },
      { id: 'bmi_calc', label: 'ИМТ', value: state.answers.bmi_calc },
      ...(name ? [{ id: 'name', label: 'Имя', value: name }] : []),
      ...(age ? [{ id: 'age', label: 'Возраст', value: age }] : []),
      ...(diet_style ? [{ id: 'diet_style', label: 'Стиль диеты', value: diet_style }] : []),
  ].filter(item => item.value !== undefined && item.value !== null && item.value !== '' && item.id !== 'goal_weight' || (item.id === 'goal_weight' && goalWeightKg));

  if (isUserLoading) {
      return <Card className="p-8"><Loader2 className="animate-spin" /></Card>;
  }

  const intakeData = {
    measures: {
      bmi,
      weight_kg: weightKg,
      goal_weight_kg: goalWeightKg,
    },
  };

  return (
    <Card className="w-full max-w-4xl shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Подтвердите свой план</CardTitle>
        <CardDescription>Проверьте свои ответы ниже. Вы можете их отредактировать, прежде чем сохранять свой план.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Ваши ответы</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {summaryItems.map((item) => (
                <div key={item.id} className="text-sm">
                    <div className="flex justify-between items-center">
                        <p className="font-semibold text-muted-foreground">{item.label}</p>
                        <Button variant="ghost" size="sm" onClick={() => jumpToQuestion(item.id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Ред.
                        </Button>
                    </div>
                    <p className="text-foreground text-base">{String(item.value)}</p>
                </div>
            ))}
          </div>
        </div>
        
        {/* Sign Up Form for unauthenticated users */}
        {!user && (
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Создайте аккаунт, чтобы сохранить</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <FormControl>
                        <Input id="email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="password">Пароль</Label>
                      <FormControl>
                        <Input id="password" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 pt-2">
                       <FormControl>
                          <Checkbox id="consent" checked={field.value} onCheckedChange={field.onChange} />
                       </FormControl>
                      <Label htmlFor="consent" className="text-sm font-normal !mt-0">Я согласен с условиями использования.</Label>
                    </FormItem>
                  )}
                />
                 {form.formState.errors.consent && <FormMessage>{form.formState.errors.consent.message}</FormMessage>}
                 {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить мой план
                </Button>
              </form>
            </Form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
                <Button variant="link" className="text-xs p-0 h-auto" disabled>Продолжить без аккаунта</Button>
            </p>
          </div>
        )}
        {/* CTA for authenticated users */}
        {user && (
            <div className="bg-muted/50 p-6 rounded-lg flex flex-col items-center justify-center space-y-6">
                {!isPlanSaved ? (
                  <>
                    <div className='text-center'>
                      <h3 className="font-bold text-lg mb-2">Все верно?</h3>
                      <p className="text-muted-foreground text-center">Нажмите ниже, чтобы сохранить свой план и начать!</p>
                    </div>
                    <Button 
                        onClick={handleSaveAndContinue}
                        className="w-full" 
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Завершить и сохранить план
                    </Button>
                  </>
                ) : (
                    <>
                      <SmartFeedbackCard bmi={bmi} intakeData={intakeData} />
                      <Button onClick={handleGoPremium} className="w-full" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Оформить Premium
                      </Button>
                    </>
                )}
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default QuizSummary;
