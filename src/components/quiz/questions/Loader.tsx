
'use client';
import { Question } from '@/lib/quiz-engine/config';
import { Loader2 } from 'lucide-react';
import { getLabel, getDescription } from '@/lib/i18n';

const Loader = ({ question }: { question: Question }) => {

  return (
    <div className="w-full max-w-md mx-auto text-center flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <div>
            <h2 className="font-headline text-3xl">{getLabel(question)}</h2>
            {getDescription(question) && <p className="text-muted-foreground mt-2">{getDescription(question)}</p>}
        </div>
    </div>
  );
};

export default Loader;
