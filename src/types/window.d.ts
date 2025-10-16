export {};

declare global {
  interface Window {
    // Google Analytics
    gtag?: (
      command: 'config' | 'event',
      target: string,
      params?: { [key: string]: any }
    ) => void;
    // Meta Pixel
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      // Standard event names are strings, but this allows for custom events too.
      // See: https://developers.facebook.com/docs/meta-pixel/reference
      eventName: string, 
      params?: { [key: string]: any }
    ) => void;
  }
}
