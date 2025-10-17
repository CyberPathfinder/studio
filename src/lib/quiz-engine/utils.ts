
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
    // It's common for expressions to fail if the dependent answer isn't available yet.
    // console.log("Could not evaluate branching logic (this may be normal):", branching.show_if);
    return false; // Hide question on error or if dependent answers are not ready
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
    const label = question.i18n?.en.label || question.label;
    if (!rules) return { isValid: true };

    if (rules.required) {
        if (value === undefined || value === null) {
            return { isValid: false, message: `${label} is required.`};
        }

        if (typeof value === 'string') {
            if (value.trim() === '') {
                return { isValid: false, message: `${label} is required.`};
            }
        }

        if (Array.isArray(value) && value.length === 0) {
            return { isValid: false, message: `${label} is required.`};
        }

        if (typeof value === 'object' && !Array.isArray(value)) {
            const recordValue = value as Record<string, unknown>;
            const expectedFields = Array.isArray(question.ui?.fields)
                ? (question.ui?.fields as string[])
                : Object.keys(recordValue);
            const missingFields = expectedFields.filter((fieldKey) => {
                const fieldValue = recordValue[fieldKey];
                if (typeof fieldValue === 'string') {
                    return fieldValue.trim() === '';
                }
                return fieldValue === undefined || fieldValue === null;
            });

            if (missingFields.length > 0) {
                const missingFieldName = missingFields[0];
                if (missingFieldName?.toLowerCase().includes('email')) {
                    return { isValid: false, message: 'Please provide a valid email address.' };
                }
                return { isValid: false, message: `Please complete the required ${missingFieldName || 'fields'}.` };
            }

            const emailFieldKey = expectedFields.find((fieldKey) => fieldKey.toLowerCase().includes('email'));
            if (emailFieldKey) {
                const emailValue = recordValue[emailFieldKey];
                if (typeof emailValue !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
                    return { isValid: false, message: 'Please provide a valid email address.' };
                }
            }

            if (expectedFields.length === 0 && Object.keys(recordValue).length === 0) {
                return { isValid: false, message: `${label} is required.` };
            }
        }
    }

    if (rules.minSelected && Array.isArray(value) && value.length < rules.minSelected) {
        return { isValid: false, message: `Please select at least ${rules.minSelected} options for ${label}.`};
    }

    if (typeof value === 'number') {
        if (Number.isNaN(value)) {
            return { isValid: false, message: `${label} must be a number.` };
        }
        if (typeof rules.min === 'number' && value < rules.min) {
            return { isValid: false, message: `${label} must be at least ${rules.min}.` };
        }
        if (typeof rules.max === 'number' && value > rules.max) {
            return { isValid: false, message: `${label} must be no more than ${rules.max}.` };
        }
        if (typeof rules.step === 'number' && typeof rules.min === 'number') {
            const remainder = Math.abs((value - rules.min) % rules.step);
            if (remainder !== 0 && remainder > 1e-8 && Math.abs(remainder - rules.step) > 1e-8) {
                return { isValid: false, message: `${label} must be in increments of ${rules.step}.` };
            }
        }
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();
        if (typeof rules.minLength === 'number' && trimmedValue.length < rules.minLength) {
            return { isValid: false, message: `${label} must be at least ${rules.minLength} characters.` };
        }
        if (typeof rules.maxLength === 'number' && trimmedValue.length > rules.maxLength) {
            return { isValid: false, message: `${label} must be no more than ${rules.maxLength} characters.` };
        }
        if (rules.pattern) {
            const pattern = new RegExp(rules.pattern);
            if (!pattern.test(trimmedValue)) {
                return { isValid: false, message: `${label} is not in the correct format.` };
            }
        }
    }

    return { isValid: true };
}
