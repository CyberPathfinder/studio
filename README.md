# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Analytics Setup

This project is configured to support Google Analytics (GA4) and Meta Pixel tracking. To enable them, create a `.env.local` file in the root of your project and add the following environment variables:

```bash
# .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=0000000000000
```

Replace the placeholder values with your actual tracking IDs. The application will automatically detect these variables and enable the respective analytics scripts. Events are logged to the browser console in development mode for easy debugging.
