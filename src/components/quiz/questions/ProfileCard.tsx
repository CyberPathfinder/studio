
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { Question } from '@/lib/quiz-engine/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription } from '@/lib/i18n';
import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfileCard = ({ question }: { question: Question }) => {
    const { state } = useQuizEngine();
    const { name, age, sex, bmi_calc } = state.answers;

  return (
    <div className="w-full max-w-lg mx-auto text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{getLabel(question)}</CardTitle>
                {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <User className="w-16 h-16 text-primary" />
                <h3 className="text-xl font-bold">{name}</h3>
                <div className="flex gap-4 text-muted-foreground">
                    <span>{age} years old</span>
                    <span>{sex}</span>
                </div>
                {question.ui?.show_bmi_badge && bmi_calc && (
                    <Badge variant={bmi_calc > 18.5 && bmi_calc < 25 ? 'default' : 'destructive'}>
                        BMI: {bmi_calc}
                    </Badge>
                )}
            </CardContent>
        </Card>
    </div>
  );
};

export default ProfileCard;
