'use client';
// lib/gtag.ts

// Reference: https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Reference: https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: { [key: string]: any }) => {
  if (window.gtag) {
    window.gtag('event', action, params);
  }
};
