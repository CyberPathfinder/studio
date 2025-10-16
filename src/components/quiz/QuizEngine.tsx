'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import QuizProgress from './QuizProgress';
import QuizControls from './QuizControls';
import * as QuestionComponents from './questions';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarRail } from '../ui/sidebar';
import { VivaFormLogo } from '../icons/logo';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { CheckCircle, Circle, Edit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';


const QuizSummarySidebar = () => {
    const { state, jumpToQuestion } = useQuizEngine();
    const { answers, config } = state;
  
    return (
      <SidebarContent>
        <ScrollArea className="h-full">
            <SidebarMenu>
                {config.sections.map((section) => (
                    <SidebarMenuItem key={section.id} className="p-2">
                        <h4 className="font-semibold text-sm mb-2 px-2">{section.i18n.en.title}</h4>
                        <ul className="flex flex-col gap-1">
                            {config.questions
                                .filter((q) => q.section === section.id)
                                .map((q) => {
                                const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
                                return (
                                    <li key={q.id}>
                                        <button 
                                            onClick={() => jumpToQuestion(q.id)}
                                            className={cn(
                                                "w-full text-left text-xs p-2 rounded-md flex items-center gap-2 hover:bg-sidebar-accent",
                                                q.id === state.currentQuestionId && "bg-sidebar-accent"
                                            )}
                                        >
                                            {hasAnswer ? <CheckCircle className="h-3 w-3 text-primary" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
                                            <span className="flex-1 truncate">{q.i18n.en.label}</span>
                                            <Edit className="h-3 w-3 invisible group-hover:visible" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
    );
};


const QuizEngine = () => {
  const { state, nextQuestion, prevQuestion } = useQuizEngine();
  const { currentQuestion } = state;
  const { toast } = useToast();


    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                // Check if target is not a textarea or button
                const target = e.target as HTMLElement;
                if(target.nodeName !== 'TEXTAREA' && target.nodeName !== 'BUTTON') {
                    e.preventDefault();
                    document.getElementById('quiz-next-btn')?.click();
                }
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                document.getElementById('quiz-prev-btn')?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextQuestion, prevQuestion]);

  if (state.status === 'completed') {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Card className="text-center p-8 max-w-lg">
                <h1 className="text-2xl font-bold font-headline">Quiz Completed!</h1>
                <p className="text-muted-foreground mt-2">Thank you for your responses. We are now calculating your personalized plan.</p>
            </Card>
        </div>
    );
  }

  if (!currentQuestion) {
     return (
        <div className="flex min-h-screen items-center justify-center">
             <Card className="text-center p-8 max-w-lg">
                <h1 className="text-xl font-bold">Loading your quiz...</h1>
            </Card>
        </div>
    );
  }

  const QuestionComponent = QuestionComponents[currentQuestion.type as keyof typeof QuestionComponents];

  const handleSaveAndExit = () => {
    toast({ title: "Progress Saved", description: "Your progress has been saved. You can continue later."});
    // In a real app, you might redirect the user or close the modal
  }

  return (
    <SidebarProvider>
        <Sidebar collapsible="icon" side="right">
             <SidebarHeader>
                <VivaFormLogo />
            </SidebarHeader>
            <QuizSummarySidebar />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleSaveAndExit} tooltip="Save & Exit">
                            <LogOut />
                            <span>Save & Exit</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
                <div className="absolute top-4 right-4 z-20">
                    <SidebarTrigger />
                </div>
                
                <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
                    <div className="p-8">
                    <QuizProgress />
                    <div className="relative mt-8 h-[28rem]">
                        <AnimatePresence mode="wait">
                        <motion.div
                            key={state.currentQuestionId}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-full"
                        >
                            {QuestionComponent ? <QuestionComponent question={currentQuestion} /> : <div>Unknown question type: {currentQuestion.type}</div>}
                        </motion.div>
                        </AnimatePresence>
                    </div>
                    </div>
                    <div className="bg-muted/60 p-4 border-t flex justify-center">
                        <QuizControls />
                    </div>
                </Card>
            </div>
        </SidebarInset>
        <SidebarRail />
    </SidebarProvider>
  );
};

export default QuizEngine;
