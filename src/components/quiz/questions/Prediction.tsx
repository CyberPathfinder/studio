
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { getLabel, getDescription } from '@/lib/i18n';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { roundToTwo } from '@/lib/unit-conversion';

const Prediction = ({ question }: { question: Question }) => {
    const { state } = useQuizEngine();
    const startWeight = state.answers['weight'];
    const goalWeight = state.answers['goal_weight'];

    if (!startWeight || !goalWeight) return <div>Missing weight data...</div>;

    const weightLossPerWeek = 0.5; // kg
    const weeks = Math.ceil(Math.abs(startWeight - goalWeight) / weightLossPerWeek);

    const data = Array.from({ length: weeks + 1 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i * 7);
        const currentWeight = startWeight > goalWeight 
            ? Math.max(goalWeight, startWeight - i * weightLossPerWeek)
            : Math.min(goalWeight, startWeight + i * weightLossPerWeek);

        return {
            date: date.toLocaleDateString('en-us', { month: 'short' }),
            weight: roundToTwo(currentWeight),
        }
    });

  return (
    <div className="w-full max-w-lg mx-auto text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{getLabel(question)}</CardTitle>
                {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                            <Tooltip />
                            <Line type="monotone" dataKey="weight" strokeWidth={2} stroke="#10b981" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            {question.disclaimer && (
                <CardFooter>
                    <p className="text-xs text-muted-foreground text-center w-full">{question.disclaimer}</p>
                </CardFooter>
            )}
        </Card>
    </div>
  );
};

export default Prediction;
