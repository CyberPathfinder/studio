'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ResumePromptProps {
  onResume: (resume: boolean) => void;
}

const ResumePrompt = ({ onResume }: ResumePromptProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 text-center">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
          <CardDescription>It looks like you have some progress saved. Would you like to continue where you left off?</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => onResume(false)}>Start Over</Button>
          <Button onClick={() => onResume(true)}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResumePrompt;
