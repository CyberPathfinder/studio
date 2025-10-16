
'use client';
import { Question } from '@/lib/quiz-engine/config';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getLabel, getDescription } from '@/lib/i18n';

const COLORS = {
  fat: '#f59e0b', // amber-500
  protein: '#3b82f6', // blue-500
  carb: '#10b981', // emerald-500
};

const DietInfo = ({ question }: { question: Question }) => {
  const macros = question.ui?.macros || { fat: 0, protein: 0, carb: 0 };
  const data = [
    { name: 'Fat', value: macros.fat, color: COLORS.fat },
    { name: 'Protein', value: macros.protein, color: COLORS.protein },
    { name: 'Carbohydrates', value: macros.carb, color: COLORS.carb },
  ];

  return (
    <div className="w-full max-w-md mx-auto text-center">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{getLabel(question)}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                    {data.map(item => (
                        <div key={item.name} className='flex items-center gap-2'>
                            <div className='w-3 h-3 rounded-full' style={{backgroundColor: item.color}}></div>
                            <span>{item.name}: {item.value}%</span>
                        </div>
                    ))}
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

export default DietInfo;
