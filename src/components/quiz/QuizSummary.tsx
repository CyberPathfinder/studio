
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
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!consent) {
      setError('You must agree to the terms.');
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
        title: 'Account Created!',
        description: 'Your account has been successfully created.',
      });

      await submitQuiz(newUser.uid);
      toast({
        title: 'Success!',
        description: 'Your personalized plan is being generated.',
      });
      // Here you would typically redirect to a dashboard
      
    } catch (error: any) {
      track('sign_up_failure', { error: error.message });
      if (error.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'This email is already in use. Please try another email or log in.',
        });
      } else {
        setError('An unexpected error occurred. Please try again.');
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnswer = (questionId: string) => {
    const answer = state.answers[questionId];
    if (answer === undefined || answer === null) return <span className="text-muted-foreground">Not answered</span>;
    if (typeof answer === 'boolean') return answer ? 'Yes' : 'No';
    if (Array.isArray(answer)) return answer.join(', ');
    if (typeof answer === 'object') return JSON.stringify(answer);
    return String(answer);
  };
  
  if (isUserLoading) {
      return <Card className="p-8"><Loader2 className="animate-spin" /></Card>;
  }

  return (
    <Card className="w-full max-w-4xl shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Confirm Your Plan</CardTitle>
        <CardDescription>Review your answers below. You can edit them before saving your plan.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-bold text-lg border-b pb-2">Your Answers</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
          {state.config.questions
            .filter(q => state.answers[q.id] !== undefined)
            .map((q) => (
            <div key={q.id} className="text-sm">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-muted-foreground">{getLabel(q)}</p>
                <Button variant="ghost" size="sm" onClick={() => jumpToQuestion(q.id)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              <p className="text-foreground text-base">{renderAnswer(q.id)}</p>
            </div>
          ))}
          </div>
        </div>
        
        {/* Sign Up Form for unauthenticated users */}
        {!user && (
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4">Create Your Account to Save</h3>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consent" checked={consent} onCheckedChange={(c) => setConsent(c as boolean)} />
                <Label htmlFor="consent" className="text-sm font-normal">I agree to the terms and conditions.</Label>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save My Plan
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
                <Button variant="link" className="text-xs p-0 h-auto" disabled>Continue without account</Button>
            </p>
          </div>
        )}
        {/* CTA for authenticated users */}
        {user && (
            <div className="bg-muted/50 p-6 rounded-lg flex flex-col items-center justify-center">
                <h3 className="font-bold text-lg mb-4 text-center">Everything look correct?</h3>
                <p className="text-muted-foreground text-center mb-6">Click below to save your plan and get started!</p>
                <Button 
                    onClick={() => {
                        setIsLoading(true);
                        submitQuiz(user.uid)
                        .then(() => toast({ title: "Success!", description: "Your plan has been saved."}))
                        .catch(() => toast({ variant: "destructive", title: "Error", description: "Could not save your plan."}))
                        .finally(() => setIsLoading(false));
                    }} 
                    className="w-full" 
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Finish & Save Plan
                </Button>
            </div>
        )}

      </CardContent>
    </Card>
  );
};

export default QuizSummary;
