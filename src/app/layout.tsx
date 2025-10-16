import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Analytics } from '@/components/layout/analytics';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/layout/theme-provider';

const title = 'VivaForm - Your Partner in Wellness';
const description = 'Effortlessly track your food, discover delicious healthy recipes, and achieve your wellness goals with VivaForm.';

export const metadata: Metadata = {
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    images: [{ url: 'https://picsum.photos/seed/viva-og/1200/630' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['https://picsum.photos/seed/viva-og/1200/630'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3cpath fill='%231BBF9A' d='M83.4,23.3c1.5-6.5,9.6-9.6,14.4-4.8c4.8,4.8,3,14-2.8,18.8c-5.8,4.8-13,4.8-17.3,0C73,32.5,73.7,39.3,71.2,44.7c-2.5,5.4-8.7,7-12.7,2.7c-4-4.3-3.8-11.7,0-16.7c-3.8,5-8,8.8-13.2,9.8'/%3e%3c/svg%3e" />
      </head>
      <body className={cn("font-body antialiased", "bg-background")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <Analytics />
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
