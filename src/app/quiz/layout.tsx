'use client';

import quizConfig from '@/data/questions.json';
import { QuizProvider } from '@/hooks/useQuizEngine';

export default function QuizLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    if (!quizConfig) {
        return <div>Error: Quiz configuration not found.</div>;
    }
    
    return (
        <QuizProvider config={quizConfig as any}>
            {children}
        </QuizProvider>
    );
}
