import { BranchingRule, Question, ValidationRules } from "./config";

/**
 * Evaluates branching logic to determine if a question should be shown.
 * @param branching - The branching rule object.
 * @param answers - The current state of all answers.
 * @returns boolean - True if the question should be shown.
 */
export const evaluateBranchingLogic = (branching: BranchingRule | null | undefined, answers: Record<string, any>): boolean => {
  if (!branching || !branching.show_if) {
    return true; // Always show if no rule
  }

  try {
    // This is a safe use of `eval` because the `show_if` string comes from our own trusted JSON configuration,
    // not from user input. The context (`answers`) is also controlled.
    // In a more complex scenario, a proper expression parser would be better.
    const result = new Function('answers', `return ${branching.show_if}`)(answers);
    return !!result;
  } catch (error) {
    console.error("Error evaluating branching logic:", branching.show_if, error);
    return false; // Hide question on error
  }
};

/**
 * Validates a single answer against a question's validation rules.
 * @param question - The question object.
 * @param value - The answer value to validate.
 * @returns { isValid: boolean, message?: string }
 */
export const validateAnswer = (question: Question, value: any): { isValid: boolean, message?: string } => {
    const rules = question.validation;
    if (!rules) return { isValid: true };

    if (rules.required) {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            return { isValid: false, message: `${question.i18n.en.label} is required.`};
        }
    }
    
    // Can add more specific validation logic here for min, max, pattern etc.

    return { isValid: true };
}
