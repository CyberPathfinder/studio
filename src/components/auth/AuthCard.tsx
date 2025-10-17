
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Пожалуйста, введите корректный email.' }),
  password: z.string().min(8, { message: 'Пароль должен содержать не менее 8 символов.' }),
});

type AuthFormValues = z.infer<typeof formSchema>;

interface AuthCardProps {
  mode: 'login' | 'signup';
}

const mapFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Этот адрес электронной почты уже используется. Попробуйте войти.';
    case 'auth/invalid-email':
      return 'Некорректный формат адреса электронной почты.';
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'Неверный email или пароль.';
    case 'auth/weak-password':
      return 'Пароль слишком слабый. Он должен содержать не менее 8 символов.';
    default:
      return 'Произошла ошибка. Пожалуйста, попробуйте снова.';
  }
};

export function AuthCard({ mode }: AuthCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true);
    form.clearErrors();

    try {
      const auth = getAuth();
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;
        
        // After creating the user, create their documents in Firestore
        const db = getFirestore();
        const batch = writeBatch(db);

        // 1. Create user document
        const userRef = doc(db, 'users', user.uid);
        batch.set(userRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          version: 1,
        }, { merge: true });

        // 2. Create initial intake document
        const intakeRef = doc(db, `users/${user.uid}/intake/initial`);
        batch.set(intakeRef, { 
          createdAt: serverTimestamp(),
          // Add any other default fields for a new intake doc here
        }, { merge: true });

        // Commit both writes at once
        await batch.commit();
        
        await updateProfile(userCredential.user, { displayName: data.email.split('@')[0] });
        toast({ title: 'Успешно!', description: 'Ваш аккаунт создан.' });
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему.' });
      }
      router.push('/dashboard');
      router.refresh(); // Forces a refresh to update server components with new user state
    } catch (error: any) {
      const friendlyMessage = mapFirebaseError(error.code);
      form.setError('root', { message: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта';
  const description = mode === 'login'
    ? 'Введите свои данные для входа.'
    : 'Заполните форму для регистрации.';
  const buttonText = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
  const linkText = mode === 'login' ? 'У меня нет аккаунта' : 'Уже есть аккаунт?';
  const linkHref = mode === 'login' ? '/signup' : '/login';

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" placeholder="m@example.com" {...field} autoFocus />
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
                  <FormLabel htmlFor="password">Пароль</FormLabel>
                  <FormControl>
                    <Input id="password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          <Link href={linkHref} className="underline">
            {linkText}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
