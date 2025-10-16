'use client';

import { useCallback } from 'react';
import { event as gtagEvent } from '@/lib/gtag';
import { event as metaEvent } from '@/lib/meta';

// Define your custom event types here
type EventName = 'quiz_start' | 'quiz_step' | 'quiz_complete';

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
  [key: string]: any;
};

// Map your custom events to analytics-specific formats
const eventMap: { [key in EventName]?: any } = {
  quiz_start: {
    gtag: { action: 'quiz_start', category: 'engagement', label: 'User started the onboarding quiz' },
    meta: { eventName: 'Lead' },
    gads: { conversionLabel: 'AW-CONVERSION-LABEL-LEAD' } // Placeholder for Google Ads
  },
  quiz_step: {
    gtag: (payload: { step: number, direction: 'next' | 'previous' }) => ({
      action: `quiz_step_${payload.step}`,
      category: 'engagement',
      label: `User went to step ${payload.step} (${payload.direction})`
    }),
    meta: null, // No specific Meta event for each step
    gads: null,
  },
  quiz_complete: {
    gtag: { action: 'quiz_complete', category: 'conversion', label: 'User completed the onboarding quiz' },
    meta: { eventName: 'CompleteRegistration' },
    gads: { conversionLabel: 'AW-CONVERSION-LABEL-SIGNUP' } // Placeholder for Google Ads
  }
};


export const useAnalytics = () => {
  const track = useCallback((eventName: EventName, payload?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, payload || '');
    }

    const mappings = eventMap[eventName];
    if (!mappings) return;

    // --- Google Analytics (GA4) ---
    const gtagMapping = mappings.gtag;
    if (gtagMapping && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      const eventData = typeof gtagMapping === 'function' ? gtagMapping(payload) : gtagMapping;
      gtagEvent(eventData);
    }
    
    // --- Meta Pixel ---
    const metaMapping = mappings.meta;
    if (metaMapping && process.env.NEXT_PUBLIC_META_PIXEL_ID) {
       metaEvent(metaMapping.eventName, payload);
    }

    // --- Google Ads ---
    // Example of how you would track a Google Ads conversion
    const gadsMapping = mappings.gads;
    if (gadsMapping && window.gtag) {
      // window.gtag('event', 'conversion', {
      //   'send_to': `AW-YOUR_CONVERSION_ID/${gadsMapping.conversionLabel}`,
      // });
    }

  }, []);

  return { track };
};
