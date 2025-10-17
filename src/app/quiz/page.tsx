'use client';
import { Suspense } from 'react';
import QuizClient from '@/components/quiz/QuizClient';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizLayout } from '@/components/quiz/QuizLayout';

function QuizLoadingSkeleton() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="absolute top-4 left-4 text-primary font-bold text-lg">VivaForm</div>
            <Card className="w-full max-w-2xl overflow-hidden shadow-md rounded-2xl p-8 space-y-8">
                <Skeleton className="h-8 w-1/2 mx-auto" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </Card>
        </div>
    )
}

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizLoadingSkeleton />}>
      <QuizLayout>
        <QuizClient />
      </QuizLayout>
    </Suspense>
  );
}
