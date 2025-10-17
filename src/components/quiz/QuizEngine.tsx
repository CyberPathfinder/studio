'use client';
import { useQuizEngine } from '@/hooks/useQuizEngine.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import QuizProgress from './QuizProgress';
import QuizControls from './QuizControls';
import * as QuestionComponents from './questions';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '../ui/sidebar';
import { VivaFormLogo } from '../icons/logo';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { CheckCircle, Circle, Edit, Lock, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import QuizSummary from './QuizSummary';
import { getLabel } from '@/lib/i18n';
import { evaluateBranchingLogic } from '@/lib/quiz-engine/utils';
import { Sheet, SheetTrigger, SheetContent as MobileSheetContent, SheetTitle, SheetHeader, SheetDescription } from '../ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';


const QuizSummarySidebar = () => {
    const { state, jumpToQuestion } = useQuizEngine();
    const { answers, config } = state;

    const answeredQuestionIds = new Set(Object.keys(answers).filter(k => answers[k] !== null && answers[k] !== undefined && answers[k] !== ''));

    const content = (
        <ScrollArea className="h-full">
            <SidebarMenu>
                {config.sections.map((section) => (
                    <SidebarMenuItem key={section.id} className="p-2">
                        <h4 className="font-semibold text-sm mb-2 px-2">{section.i18n?.en.title || section.title}</h4>
                        <ul className="flex flex-col gap-1">
                            {config.questions
                                .filter((q) => evaluateBranchingLogic(q.branching, answers) && q.section === section.id)
                                .map((q) => {
                                const isAnswered = answeredQuestionIds.has(q.id);
                                const isCurrent = q.id === state.currentQuestionId;
                                const isFuture = !isAnswered && !isCurrent;

                                let Icon = Circle;
                                if (isAnswered) Icon = CheckCircle;
                                if (isFuture) Icon = Lock;

                                let iconColor = "text-muted-foreground";
                                if (isAnswered) iconColor = "text-primary";
                                if (isCurrent) iconColor = "text-primary";


                                return (
                                    <li key={q.id} className="group">
                                        <button 
                                            onClick={() => !isFuture && jumpToQuestion(q.id)}
                                            disabled={isFuture}
                                            className={cn(
                                                "w-full text-left text-sm p-2 rounded-md flex items-start gap-2",
                                                !isFuture && "hover:bg-sidebar-accent",
                                                isCurrent && "bg-sidebar-accent font-semibold",
                                                isFuture && "cursor-not-allowed opacity-60"
                                            )}
                                        >
                                            <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconColor)} />
                                            <span className="flex-1 text-wrap">{getLabel(q)}</span>
                                            {!isFuture && <Edit className="h-4 w-4 invisible group-hover:visible flex-shrink-0" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </ScrollArea>
    );

    const isMobile = useIsMobile();

    if (isMobile) {
        return (
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open quiz sections menu">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </SheetTrigger>
                <MobileSheetContent side="left" className="p-0 w-[300px]">
                   <SheetHeader className="p-4 border-b">
                     <SheetTitle>Quiz Sections</SheetTitle>
                     <SheetDescription>
                       Review your answers or jump to a specific section.
                     </SheetDescription>
                   </SheetHeader>
                    {content}
                </MobileSheetContent>
            </Sheet>
        )
    }

    return (
        <SidebarContent>
           {content}
        </SidebarContent>
    )
};


const QuizEngine = () => {
  const { state } = useQuizEngine();
  const { currentQuestion } = state;
  const { toast } = useToast();
  const isMobile = useIsMobile();


    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // Don't trigger on textareas or buttons to allow normal interaction
                if(target.nodeName !== 'TEXTAREA' && target.nodeName !== 'BUTTON') {
                    e.preventDefault();
                    // This will trigger the `nextQuestion` function via the controls component
                    document.querySelector<HTMLButtonElement>('button[aria-label="Go to next step (Enter)"], button[aria-label="Finish Quiz (Enter)"]')?.click();
                }
            } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                // This will trigger the `prevQuestion` function via the controls component
                document.querySelector<HTMLButtonElement>('button[aria-label="Go to previous step (Shift + Enter)"]')?.click();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // Empty dependency array means this effect runs once on mount

  if (state.status === 'completed') {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <QuizSummary />
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
        <Sidebar collapsible="icon" side="right" className="hidden md:block">
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
            <div className="relative flex flex-col items-center justify-start bg-muted/40 md:justify-center min-h-screen p-4">
                <div className="absolute top-4 right-4 z-20 hidden md:block">
                    <SidebarTrigger />
                </div>
                 <div className="absolute top-4 left-4 z-20 md:hidden">
                    <QuizSummarySidebar />
                </div>
                
                <Card className="w-full max-w-2xl overflow-hidden shadow-md rounded-2xl flex flex-col">
                    <div className="p-6 md:p-8 pb-24 md:pb-8">
                        <QuizProgress />
                        <div className="relative mt-8 h-[28rem] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                            <motion.div
                                key={state.currentQuestionId}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="absolute w-full px-4 md:px-0"
                            >
                                {QuestionComponent ? <QuestionComponent question={currentQuestion} /> : <div>Unknown question type: {currentQuestion.type}</div>}
                            </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className={cn(
                        "bg-muted/60 p-6 border-t",
                        "md:relative", // Stays at bottom of card on desktop
                        isMobile && "fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm pb-[calc(1rem+env(safe-area-inset-bottom))]"
                    )}>
                        <QuizControls />
                    </div>
                </Card>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
};

export default QuizEngine;
