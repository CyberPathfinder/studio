
'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { Question } from '@/lib/quiz-engine/config';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getLabel, getDescription } from '@/lib/i18n';

const LeadCapture = ({ question }: { question: Question }) => {
  const { state, handleAnswerChange } = useQuizEngine();
  const answer = state.answers[question.id] || {};

  const onChange = (field: string, value: string) => {
    handleAnswerChange(question.id, {...answer, [field]: value});
  }

  return (
    <div className="w-full max-w-md mx-auto text-left">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="font-headline text-3xl">{getLabel(question)}</CardTitle>
        {getDescription(question) && <CardDescription>{getDescription(question)}</CardDescription>}
      </CardHeader>

      <div className="space-y-4">
        {question.ui?.fields.map((field: string) => (
             <div key={field}>
                <Label htmlFor={`${question.id}-${field}`} className='capitalize'>{field}</Label>
                <Input
                    id={`${question.id}-${field}`}
                    type={field === 'email' ? 'email' : 'text'}
                    value={answer[field] || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    placeholder={`Enter your ${field}`}
                    className="h-12 text-lg"
                />
            </div>
        ))}
      </div>
      
    </div>
  );
};

export default LeadCapture;
