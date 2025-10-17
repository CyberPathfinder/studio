
'use client';

import { useCallback } from 'react';
import { event as gtagEvent } from '@/lib/gtag';
import { event as metaEvent } from '@/lib/meta';

// Define your custom event types here for strong typing
export type EventName =
  | 'quiz_start'
  | 'quiz_resume'
  | 'quiz_step_view'
  | 'quiz_unit_change'
  | 'quiz_answer'
  | 'quiz_complete'
  | 'sign_up_attempt'
  | 'sign_up_success'
  | 'sign_up_failure'
  | 'intake_saved'
  | 'smart_feedback_view'
  | 'checkout_start'
  | 'checkout_success';

// Defines the structure for analytics mapping for each service
type AnalyticsMapping = {
  gtag?: (payload?: any) => { action: string; [key: string]: any };
  meta?: (payload?: any) => { eventName: string; params?: object };
  gads?: (payload?: any) => { conversionLabel: string };
};

// Map your custom events to analytics-specific formats
const eventMap: Record<EventName, AnalyticsMapping> = {
  quiz_start: {
    gtag: () => ({ action: 'quiz_start', category: 'engagement', label: 'User started a new quiz' }),
    meta: () => ({ eventName: 'Lead' }),
  },
  quiz_resume: {
    gtag: () => ({ action: 'quiz_resume', category: 'engagement', label: 'User resumed a quiz' }),
  },
  quiz_step_view: {
    gtag: (payload: { step: string; }) => ({
      action: `quiz_step_view`,
      category: 'engagement',
      label: `User viewed step: ${payload.step}`,
      value: payload.step,
    }),
    meta: (payload: { step: string }) => ({ eventName: 'QuizStepView', params: { step: payload.step } }),
  },
  quiz_unit_change: {
    gtag: (payload: { field: string; unit: string; }) => ({
      action: 'quiz_unit_change',
      category: 'engagement',
      label: `User changed unit for ${payload.field} to ${payload.unit}`,
    }),
  },
  quiz_answer: {
     gtag: (payload: { analyticsKey: string, value: any }) => ({
      action: 'quiz_answer',
      category: 'engagement',
      label: `Question: ${payload.analyticsKey}`,
      value: typeof payload.value === 'object' ? JSON.stringify(payload.value) : payload.value,
    }),
    meta: (payload: { analyticsKey: string, value: any }) => ({ eventName: 'QuizAnswer', params: { question: payload.analyticsKey, answer: payload.value } }),
  },
  quiz_complete: {
     gtag: () => ({ action: 'quiz_complete', category: 'conversion', label: 'User reached the summary screen' }),
  },
  sign_up_attempt: {
    gtag: () => ({ action: 'sign_up_attempt', category: 'engagement', label: 'User attempted to sign up' }),
  },
  sign_up_success: {
    gtag: (payload: { uid: string, method: string }) => ({ action: 'sign_up_success', category: 'conversion', label: 'User created an account', user_id: payload.uid, method: payload.method }),
    meta: () => ({ eventName: 'CompleteRegistration' }),
    gads: () => ({ conversionLabel: 'AW-CONVERSION-LABEL-SIGNUP' }), // Placeholder
  },
   sign_up_failure: {
    gtag: (payload: { error: string }) => ({ action: 'sign_up_failure', category: 'error', label: payload.error }),
  },
  intake_saved: {
    gtag: (payload: { docPath: string }) => ({ action: 'intake_saved', category: 'conversion', label: 'User intake data was saved', doc_path: payload.docPath }),
    meta: () => ({ eventName: 'IntakeSaved' }),
  },
  smart_feedback_view: {
     gtag: (payload: { bmiBand: string, tipsCount: number }) => ({
        action: 'smart_feedback_view',
        category: 'engagement',
        label: `BMI Band: ${payload.bmiBand}`,
        value: payload.tipsCount,
     })
  },
  checkout_start: {
    gtag: (payload: { planId: string }) => ({ action: 'begin_checkout', category: 'ecommerce', items: [{ item_id: payload.planId }] }),
    meta: () => ({ eventName: 'InitiateCheckout' }),
  },
  checkout_success: {
    gtag: (payload: { transaction_id: string, value: number, currency: string, planId: string }) => ({
      action: 'purchase',
      category: 'ecommerce',
      transaction_id: payload.transaction_id,
      value: payload.value,
      currency: payload.currency,
      items: [{ item_id: payload.planId, quantity: 1 }],
    }),
    meta: (payload: { value: number, currency: string }) => ({ eventName: 'Purchase', params: { value: payload.value, currency: payload.currency } }),
  },
};

export const useAnalytics = () => {
  const track = useCallback((eventName: EventName, payload?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, payload || '');
    }

    const mappings = eventMap[eventName];
    if (!mappings) return;

    // --- Google Analytics (GA4) ---
    if (mappings.gtag && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const eventData = mappings.gtag(payload);
      gtagEvent(eventData.action, eventData);
    }

    // --- Meta Pixel ---
    if (mappings.meta && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
      const { eventName, params } = mappings.meta(payload);
      metaEvent(eventName, params);
    }

    // --- Google Ads ---
    if (mappings.gads && window.gtag) {
      // const { conversionLabel } = mappings.gads(payload);
      // window.gtag('event', 'conversion', {
      //   send_to: `AW-YOUR_CONVERSION_ID/${conversionLabel}`,
      // });
    }
  }, []);

  return { track };
};
