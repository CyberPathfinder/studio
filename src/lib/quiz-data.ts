import { z } from 'zod';

// Step 1: Goal
export const GoalSchema = z.object({
  goal: z.enum(['lose_weight', 'maintain_weight', 'gain_muscle'], {
    required_error: 'Please select a goal to continue.',
  }),
});
export type Goal = z.infer<typeof GoalSchema>;

// Step 2: Demographics
export const DemographicsSchema = z.object({
  sex: z.enum(['male', 'female', 'other'], { required_error: 'Please select an option.' }),
  age: z.coerce.number().int().min(1, "Age is required."),
});
export type Demographics = z.infer<typeof DemographicsSchema>;

// Step 3: Measurements
export const MeasurementsSchema = z.object({
  height: z.coerce.number().int().min(1, "Height is required."),
  weight: z.coerce.number().int().min(1, "Weight is required."),
});
export type Measurements = z.infer<typeof MeasurementsSchema>;

// --- Empty Schemas for Future Steps ---
export const DietSchema = z.object({});
export type Diet = z.infer<typeof DietSchema>;

export const RestrictionsSchema = z.object({});
export type Restrictions = z.infer<typeof RestrictionsSchema>;

export const ActivitySchema = z.object({});
export type Activity = z.infer<typeof ActivitySchema>;


// Combined Schema for the entire quiz
export const QuizSchema = GoalSchema.merge(DemographicsSchema)
  .merge(MeasurementsSchema)
  .merge(DietSchema)
  .merge(RestrictionsSchema)
  .merge(ActivitySchema);

export type QuizData = z.infer<typeof QuizSchema>;

export const defaultQuizValues: Partial<QuizData> = {
  goal: undefined,
  sex: undefined,
  age: 25,
  height: 170,
  weight: 70,
};

export type QuizStepId = 'goal' | 'demographics' | 'measurements' | 'diet' | 'restrictions' | 'activity' | 'summary';

type QuizStep = {
  step: number;
  id: QuizStepId;
  title: string;
  fields?: (keyof QuizData)[];
};

export const quizSteps: QuizStep[] = [
  { step: 1, id: 'goal', title: 'Your Goal', fields: ['goal'] },
  { step: 2, id: 'demographics', title: 'About You', fields: ['sex', 'age'] },
  { step: 3, id: 'measurements', title: 'Your Measurements', fields: ['height', 'weight'] },
  { step: 4, id: 'diet', title: 'Diet' },
  { step: 5, id: 'restrictions', title: 'Restrictions' },
  { step: 6, id: 'activity', title: 'Activity Level' },
  { step: 7, id: 'summary', title: 'Summary' },
];
