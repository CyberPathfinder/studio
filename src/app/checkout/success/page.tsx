
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { logger } from '@/lib/logger';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('An unknown error occurred.');
  const { track } = useAnalytics();

  useEffect(() => {
    if (!sessionId) {
      setErrorMessage("No session ID found. Your payment cannot be confirmed.");
      setStatus('error');
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json();

        if (res.ok && data.ok) {
          setStatus('success');
          track('checkout_success', {
            transaction_id: sessionId,
            value: 10, // Placeholder value
            currency: 'USD',
            planId: 'premium_monthly',
          });
        } else {
          throw new Error(data.error || 'Verification failed.');
        }
      } catch (err: any) {
        logger.error("Error verifying payment session:", err);
        setErrorMessage(err.message || "Could not verify your payment. Please contact support.");
        setStatus('error');
      }
    };

    verifySession();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'verifying') {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please do not close this page.</p>
        </div>
    );
  }

  if (status === 'error') {
     return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Payment Verification Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    If you believe this is an error, please contact our support team.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </CardContent>
      </Card>
     )
  }

  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
        <CardDescription>Thank you for your purchase.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
            Your premium access is now active. A confirmation has been sent to your email.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">Session ID: {sessionId}</p>
      </CardContent>
    </Card>
  );
}

export default function SuccessPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
