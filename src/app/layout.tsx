import type {Metadata} from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'VivaForm - Your Partner in Wellness',
  description: 'Effortlessly track your food, discover delicious healthy recipes, and achieve your wellness goals with VivaForm.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "bg-gradient-to-b from-background via-background to-white")}>
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
