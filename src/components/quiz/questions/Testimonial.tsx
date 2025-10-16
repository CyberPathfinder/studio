
'use client';
import { Question } from '@/lib/quiz-engine/config';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { getLabel } from '@/lib/i18n';

const Testimonial = ({ question }: { question: Question }) => {
  const { name, location, stars } = question.ui || {};

  return (
    <div className="w-full max-w-md mx-auto text-center">
        <Card className="bg-muted/30">
            <CardHeader>
                <div className="flex justify-center items-center gap-2">
                    <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${name}`} />
                        <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold">{name}</p>
                        <p className="text-xs text-muted-foreground">{location}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="italic">"{getLabel(question)}"</p>
            </CardContent>
            {stars && (
                 <CardFooter className='justify-center'>
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                    </div>
                </CardFooter>
            )}
        </Card>
    </div>
  );
};

export default Testimonial;
