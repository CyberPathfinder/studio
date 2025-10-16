'use client';

import { useCallback } from 'react';
import { event as gtagEvent } from '@/lib/gtag';
import { event as metaEvent } from '@/lib/meta';

// Define your custom event types here for strong typing
type EventName =
  | 'quiz_start'
  | 'quiz_step'
  | 'sign_up_attempt'
  | 'sign_up_success'
  | 'intake_saved';

// Defines the structure for analytics mapping for each service
type AnalyticsMapping = {
  gtag?: (payload?: any) => { action: string; [key: string]: any };
  meta?: (payload?: any) => { eventName: string; params?: object };
  gads?: (payload?: any) => { conversionLabel: string };
};

// Map your custom events to analytics-specific formats
const eventMap: Record<EventName, AnalyticsMapping> = {
  quiz_start: {
    gtag: () => ({ action: 'quiz_start', category: 'engagement', label: 'User started the onboarding quiz' }),
    meta: () => ({ eventName: 'Lead' }),
    gads: () => ({ conversionLabel: 'AW-CONVERSION-LABEL-LEAD' }), // Placeholder for Google Ads
  },
  quiz_step: {
    gtag: (payload: { step: number; direction: 'next' | 'previous' | 'jump' }) => ({
      action: `quiz_step_${payload.step}`,
      category: 'engagement',
      label: `User went to step ${payload.step} (${payload.direction})`,
    }),
  },
  sign_up_attempt: {
    gtag: () => ({ action: 'sign_up_attempt', category: 'engagement', label: 'User attempted to sign up' }),
  },
  sign_up_success: {
    gtag: (payload: { uid: string }) => ({ action: 'sign_up_success', category: 'conversion', label: 'User created an account', user_id: payload.uid }),
    meta: () => ({ eventName: 'CompleteRegistration' }),
    gads: () => ({ conversionLabel: 'AW-CONVERSION-LABEL-SIGNUP' }), // Placeholder for Google Ads
  },
  intake_saved: {
    gtag: () => ({ action: 'intake_saved', category: 'conversion', label: 'User intake data was saved' }),
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
