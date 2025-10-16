'use client';

import React, { createContext, useState, useCallback, useMemo } from 'react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QuizSchema, defaultQuizValues, QuizData, quizSteps } from '@/lib/quiz-data';
import { useAnalytics } from '@/hooks/use-analytics';

type QuizContextType = {
  currentStep: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  form: UseFormReturn<QuizData>;
};

export const QuizContext = createContext<QuizContextType | null>(null);

export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = quizSteps.length;
  const { track } = useAnalytics();


  const form = useForm<QuizData>({
    resolver: zodResolver(QuizSchema),
    defaultValues: defaultQuizValues,
    mode: 'onChange',
  });

  const nextStep = useCallback(async () => {
    const currentStepInfo = quizSteps.find(q => q.step === currentStep);
    // @ts-ignore
    const fieldsToValidate = currentStepInfo?.fields || [];
    // @ts-ignore
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < totalSteps) {
        const nextStepNumber = currentStep + 1;
        setCurrentStep(nextStepNumber);
        track('quiz_step', { step: nextStepNumber, direction: 'next' });
      }
    }
  }, [currentStep, totalSteps, form, track]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      track('quiz_step', { step: prevStepNumber, direction: 'previous' });
    }
  }, [currentStep, track]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const contextValue = useMemo(() => ({
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
goToStep,
    isFirstStep,
    isLastStep,
    form,
  }), [currentStep, totalSteps, nextStep, prevStep, goToStep, isFirstStep, isLastStep, form]);

  return (
    <QuizContext.Provider value={contextValue}>
      <FormProvider {...form}>
        {children}
      </FormProvider>
    </QuizContext.Provider>
  );
};
