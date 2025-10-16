
import { Question, QuestionOption } from "./quiz-engine/config";

// This is a simple i18n helper. In a real app, you'd use a library like react-i18next.

export const getLabel = (question: Question, lang: 'en' | 'ru' = 'en'): string => {
    return question.i18n?.[lang]?.label || question.label;
}

export const getDescription = (question: Question, lang: 'en' | 'ru' = 'en'): string | undefined => {
    return question.i18n?.[lang]?.description || question.description;
}

export const getHint = (question: Question, lang: 'en' | 'ru' = 'en'): string | undefined => {
    return question.i18n?.[lang]?.hint || question.hint;
}

export const getOptions = (question: Question, lang: 'en' | 'ru' = 'en'): QuestionOption[] | undefined => {
    return question.i1bn?.[lang]?.options || question.options;
}
