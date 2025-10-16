// lib/meta.ts

// Reference: https://developers.facebook.com/docs/meta-pixel/get-started
export const pageview = () => {
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Reference: https://developers.facebook.com/docs/meta-pixel/reference
export const event = (name: string, options: Record<string, any> = {}) => {
  if (window.fbq) {
    window.fbq('track', name, options);
  }
};
