
'use client';
import { Question } from '@/lib/quiz-engine/config';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getLabel, getDescription } from '@/lib/i18n';

const Message = ({ question }: { question: Question }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center">
       {question.emoji && <div className="text-6xl mb-4">{question.emoji}</div>}
      <CardHeader className="text-center p-0">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription className="mt-2 text-lg">{getDescription(question)}</CardDescription>}
      </CardHeader>
    </div>
  );
};

export default Message;
