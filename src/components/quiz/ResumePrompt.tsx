'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useState } from 'react';

interface ResumePromptProps {
  onResume: (resume: boolean) => void;
}

const ResumePrompt = ({ onResume }: ResumePromptProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleStartOver = () => {
    setIsVisible(false);
    onResume(false);
  }

  const handleContinue = () => {
    setIsVisible(false);
    onResume(true);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">Welcome Back!</h3>
                    <p className="text-sm text-muted-foreground">Continue where you left off?</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleStartOver}>Start Over</Button>
                    <Button size="sm" onClick={handleContinue}>Continue</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsVisible(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default ResumePrompt;
