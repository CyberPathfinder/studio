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
      target: string,
      params?: { [key: string]: any }
    ) => void;
  }
}
