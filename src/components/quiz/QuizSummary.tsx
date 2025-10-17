
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

const QuizSummary = () => {
  const { state, jumpToQuestion, submitQuiz } = useQuizEngine();
  const { user, isUserLoading } = useFirebase();
  const { track } = useAnalytics();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Пароль должен содержать не менее 8 символов.');
      return;
    }
    if (!consent) {
      setError('Вы должны согласиться с условиями.');
      return;
    }

    setIsLoading(true);
    track('sign_up_attempt');

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      track('sign_up_success', { uid: newUser.uid });
      toast({
        title: 'Аккаунт создан!',
        description: 'Ваш аккаунт был успешно создан.',
      });

      await submitQuiz(newUser.uid);
      toast({
        title: 'Успешно!',
        description: 'Ваш персональный план генерируется.',
      });
      // Here you would typically redirect to a dashboard
      
    } catch (error: any) {
      track('sign_up_failure', { error: error.message });
      if (error.code === 'auth/email-already-in-use') {
        setError('Этот адрес электронной почты уже используется.');
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: 'Этот email уже используется. Пожалуйста, попробуйте другой или войдите в систему.',
        });
      } else {
        setError('Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.');
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { body, diet_style, name, age } = state.answers;
  const { heightCm, weightKg, goalWeightKg, unitHeight, unitWeight } = body || {};

  const displayHeight = unitHeight === 'metric' 
    ? `${roundToTwo(heightCm || 0)} cm`
    : `${convertCmToFtIn(heightCm).feet} ft ${convertCmToFtIn(heightCm).inches} in`;
  
  const displayWeight = unitWeight === 'metric'
    ? `${roundToTwo(weightKg || 0)} kg`
    : `${roundToTwo(convertWeight(weightKg || 0, 'kg', 'lb'))} lb`;
    
  const displayGoalWeight = unitWeight === 'metric'
    ? `${roundToTwo(goalWeightKg || 0)} kg`
    : `${roundToTwo(convertWeight(goalWeightKg || 0, 'kg', 'lb'))} lb`;


  const summaryItems = [
      { id: 'height', label: 'Рост', value: displayHeight },
      { id: 'weight', label: 'Текущий вес', value: displayWeight },
      { id: 'goal_weight', label: 'Целевой вес', value: displayGoalWeight },
      { id: 'bmi_calc', label: 'ИМТ', value: state.answers.bmi_calc },
      ...(name ? [{ id: 'name', label: 'Имя', value: name }] : []),
      ...(age ? [{ id: 'age', label: 'Возраст', value: age }] : []),
      ...(diet_style ? [{ id: 'diet_style', label: 'Стиль диеты', value: diet_style }] : []),
  ].filter(item => item.value !== undefined && item.value !== null && item.value !== '');

  if (isUserLoading) {
      return <Card className="p-8"><Loader2 className="animate-spin" /></Card>;
  }

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
                    <p className="text-foreground text-base">{item.value}</p>
                </div>
            ))}
          </div>
        </div>
        
        {/* Sign Up Form for unauthenticated users */}
        {!user && (
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Создайте аккаунт, чтобы сохранить</h3>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c as boolean)} />
                <Label htmlFor="consent" className="text-sm font-normal">Я согласен с условиями использования.</Label>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Сохранить мой план
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
                <Button variant="link" className="text-xs p-0 h-auto" disabled>Продолжить без аккаунта</Button>
            </p>
          </div>
        )}
        {/* CTA for authenticated users */}
        {user && (
            <div className="bg-muted/50 p-6 rounded-lg flex flex-col items-center justify-center">
                <h3 className="font-bold text-lg mb-4 text-center">Все верно?</h3>
                <p className="text-muted-foreground text-center mb-6">Нажмите ниже, чтобы сохранить свой план и начать!</p>
                <Button 
                    onClick={() => {
                        setIsLoading(true);
                        submitQuiz(user.uid)
                        .then(() => toast({ title: "Успешно!", description: "Ваш план был сохранен."}))
                        .catch(() => toast({ variant: "destructive", title: "Ошибка", "description": "Не удалось сохранить ваш план."}))
                        .finally(() => setIsLoading(false));
                    }} 
                    className="w-full" 
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Завершить и сохранить план
                </Button>
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default QuizSummary;
