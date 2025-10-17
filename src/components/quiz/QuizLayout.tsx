
'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, Circle, Edit, Lock, LogOut, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuizEngine } from "@/hooks/useQuizEngine";
import { getLabel } from "@/lib/i18n";
import { evaluateBranchingLogic } from "@/lib/quiz-engine/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { VivaFormLogo } from "../icons/logo";
import { logger } from "@/lib/logger";

const LOCAL_STORAGE_KEY = "vf_sidebar_open";

type QuizLayoutContextType = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

const QuizLayoutContext = createContext<QuizLayoutContextType | null>(null);

export const useQuizLayout = () => {
  const context = useContext(QuizLayoutContext);
  if (!context) {
    throw new Error("useQuizLayout must be used within a QuizLayoutProvider");
  }
  return context;
};

const QuizSummarySidebar = () => {
    const { state, jumpToQuestion } = useQuizEngine();
    const { toast } = useToast();
    const { answers, config } = state;

    const answeredQuestionIds = new Set(Object.keys(answers).filter(k => k !== 'body' && answers[k] !== null && answers[k] !== undefined && answers[k] !== ''));

    const handleSaveAndExit = () => {
        toast({ title: "Progress Saved", description: "Your progress has been saved. You can continue later."});
        // In a real app, you might want to redirect the user here.
        // For now, we'll just show a toast.
    }

    const content = (
        <>
            <div className="p-4 border-b">
                <VivaFormLogo />
            </div>
            <ScrollArea className="h-full flex-1 scroll-shadow-y">
                <Accordion type="multiple" defaultValue={config.sections.map(s => s.id)} className="w-full p-2">
                    {config.sections
                        .filter(section => config.questions.some(q => q.section === section.id && evaluateBranchingLogic(q.branching, answers)))
                        .map((section) => {
                        
                        const sectionQuestions = config.questions.filter((q) => evaluateBranchingLogic(q.branching, answers) && q.section === section.id);
                        if (sectionQuestions.length === 0) return null;

                        const answeredInSection = sectionQuestions.filter(q => {
                            if (q.id === 'height') {
                                const heightCm = answers.body?.heightCm;
                                return heightCm && heightCm >= 120 && heightCm <= 230;
                            }
                            if (q.id === 'weight') {
                                const weightKg = answers.body?.weightKg;
                                return weightKg && weightKg >= 35 && weightKg <= 300;
                            }
                            return answeredQuestionIds.has(q.id);
                        }).length;
                        const totalInSection = sectionQuestions.length;

                        return (
                        <AccordionItem value={section.id} key={section.id} className="border-none">
                            <AccordionTrigger className="px-2 py-2 text-sm font-semibold hover:no-underline hover:bg-muted/50 rounded-md">
                               <div className="flex-1 text-left">{section.i18n?.en.title || section.title}</div>
                               <div className="flex items-center gap-1.5 ml-2">
                                    {Array.from({ length: totalInSection }).map((_, i) => (
                                        <div key={i} className={cn(
                                            "w-2 h-2 rounded-full",
                                            i < answeredInSection ? "bg-primary/80" : "bg-muted-foreground/30"
                                        )}></div>
                                    ))}
                               </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <ul className="flex flex-col gap-1 pt-1">
                                    {sectionQuestions.map((q) => {
                                        let isAnswered = answeredQuestionIds.has(q.id);

                                        if (q.id === 'height') {
                                            const heightCm = answers.body?.heightCm;
                                            isAnswered = !!(heightCm && heightCm >= 120 && heightCm <= 230);
                                        } else if (q.id === 'weight') {
                                            const weightKg = answers.body?.weightKg;
                                            isAnswered = !!(weightKg && weightKg >= 35 && weightKg <= 300);
                                        }
                                        
                                        const isCurrent = q.id === state.currentQuestionId;
                                        const canJump = isAnswered || isCurrent;

                                        let Icon = Circle;
                                        if (isAnswered) Icon = CheckCircle;
                                        if (!canJump) Icon = Lock;

                                        let iconColor = "text-muted-foreground/60";
                                        if (isAnswered) iconColor = "text-primary/80";
                                        if (isCurrent) iconColor = "text-primary";

                                        return (
                                            <li key={q.id} className="group px-2">
                                                <button 
                                                    onClick={() => canJump && jumpToQuestion(q.id)}
                                                    disabled={!canJump}
                                                    className={cn(
                                                        "w-full text-left text-sm p-2 rounded-md flex items-start gap-2.5 relative",
                                                        canJump && "hover:bg-muted",
                                                        isCurrent && "bg-muted/80 font-semibold",
                                                        !canJump && "cursor-not-allowed opacity-60"
                                                    )}
                                                >
                                                    {isCurrent && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4/5 w-0.5 bg-primary rounded-full"></div>}
                                                    <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", iconColor)} />
                                                    <span className="flex-1 text-wrap">{getLabel(q)}</span>
                                                    {canJump && <Edit className="h-4 w-4 invisible group-hover:visible flex-shrink-0" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    )})}
                </Accordion>
            </ScrollArea>
             <div className="p-2 border-t mt-auto">
                <Button onClick={handleSaveAndExit} variant="ghost" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Save & Exit</span>
                </Button>
            </div>
        </>
    );
    
    return content;
};

export const QuizLayout = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const isMobile = useIsMobile(1280);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedState) {
                setIsSidebarOpen(JSON.parse(savedState));
            }
        } catch (error) {
            logger.error("Could not parse sidebar state from localStorage", error);
        }
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => {
            const newState = !prev;
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
            } catch (error) {
                logger.error("Could not save sidebar state to localStorage", error);
            }
            return newState;
        });
    };

    const contextValue = {
        isSidebarOpen,
        toggleSidebar,
    };

    if (isMobile) {
        return (
            <QuizLayoutContext.Provider value={contextValue}>
                 <div className="absolute top-4 left-4 z-20">
                     <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" aria-label="Open sections menu">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[320px] flex flex-col">
                           <SheetHeader className="p-4 border-b">
                             <SheetTitle>Quiz Sections</SheetTitle>
                             <SheetDescription>
                               Review your answers or jump to a specific section.
                             </SheetDescription>
                           </SheetHeader>
                           <QuizSummarySidebar />
                        </SheetContent>
                    </Sheet>
                </div>
                <div className="p-4 md:p-6 lg:p-8 flex justify-center">
                    {children}
                </div>
            </QuizLayoutContext.Provider>
        )
    }

  return (
    <QuizLayoutContext.Provider value={contextValue}>
      <div className={cn(
          "grid items-start transition-[grid-template-columns] duration-300",
          isSidebarOpen ? "grid-cols-[1fr_320px]" : "grid-cols-[1fr_56px]"
      )}>
        <main className="p-4 md:p-6 lg:p-8 flex justify-center">
            {children}
        </main>
        
        <aside className="sticky top-[72px] h-[calc(100vh-96px)] flex flex-col border-l bg-card shadow-md rounded-tl-2xl">
            <div className="p-2 border-b">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleSidebar} 
                    aria-expanded={isSidebarOpen}
                    aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                 >
                    <ChevronLeft className={cn("h-5 w-5 transition-transform", !isSidebarOpen && "rotate-180")} />
                </Button>
            </div>
            
            {isSidebarOpen ? (
                <QuizSummarySidebar />
            ) : (
                <div className="flex flex-col items-center py-4">
                    {/* Placeholder for section dots in collapsed view */}
                </div>
            )}
        </aside>
      </div>
    </QuizLayoutContext.Provider>
  );
};
