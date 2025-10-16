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

// Step 4: Diet
export const DietSchema = z.object({
    diet: z.enum(['omnivore', 'vegetarian', 'vegan', 'pescetarian'], { required_error: 'Please select a diet preference.' }),
    dislikes: z.string().optional(),
});
export type Diet = z.infer<typeof DietSchema>;


// Step 5: Restrictions
export const RestrictionsSchema = z.object({
  restrictions: z.object({
    lactose: z.boolean().default(false),
    gluten: z.boolean().default(false),
    nuts: z.boolean().default(false),
    other: z.boolean().default(false),
    other_text: z.string().optional(),
  }),
}).refine(data => {
    // if other is checked, other_text must not be empty
    if (data.restrictions.other) {
        return data.restrictions.other_text && data.restrictions.other_text.length > 0;
    }
    return true;
}, {
    message: "Please specify your 'other' restriction.",
    path: ["restrictions.other_text"],
});
export type Restrictions = z.infer<typeof RestrictionsSchema>;


// Step 6: Activity Level
export const ActivitySchema = z.object({
  activity_level: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active'], { required_error: 'Please select an activity level.'}),
});
export type Activity = z.infer<typeof ActivitySchema>;

// --- Empty Schemas for Future Steps ---
export const SummarySchema = z.object({});
export type Summary = z.infer<typeof SummarySchema>;


// Combined Schema for the entire quiz
export const QuizSchema = GoalSchema.merge(DemographicsSchema)
  .merge(MeasurementsSchema)
  .merge(DietSchema)
  .merge(RestrictionsSchema)
  .merge(ActivitySchema)
  .merge(SummarySchema);

export type QuizData = z.infer<typeof QuizSchema>;

export const defaultQuizValues: Partial<QuizData> = {
  goal: undefined,
  sex: undefined,
  age: 25,
  height: 170,
  weight: 70,
  diet: 'omnivore',
  dislikes: '',
  restrictions: {
    lactose: false,
    gluten: false,
    nuts: false,
    other: false,
    other_text: '',
  },
  activity_level: 'light',
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
  { step: 4, id: 'diet', title: 'Diet', fields: ['diet'] },
  { step: 5, id: 'restrictions', title: 'Restrictions', fields: ['restrictions'] },
  { step: 6, id: 'activity', title: 'Activity Level', fields: ['activity_level'] },
  { step: 7, id: 'summary', title: 'Summary' },
];
