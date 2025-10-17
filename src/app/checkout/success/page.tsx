
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAnalytics } from '@/hooks/use-analytics';
import { logger } from '@/lib/logger';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useFirebase();
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);
  const { track } = useAnalytics();

  useEffect(() => {
    if (!sessionId) {
        setError("No session ID found. Your payment may not have been confirmed.");
        setIsUpdating(false);
        return;
    }
    if (!user) {
        // This can happen if the user's session expires during checkout.
        setError("You must be logged in to confirm a payment. Please log in and check your dashboard.");
        setIsUpdating(false);
        return;
    }

    const updatePaymentStatus = async () => {
      try {
        const paymentRef = doc(getFirestore(), `users/${user.uid}/payments/${sessionId}`);
        await setDoc(paymentRef, { status: 'success', updatedAt: serverTimestamp() }, { merge: true });
        track('checkout_success', {
          transaction_id: sessionId,
          value: 10, // Assuming a fixed value for now
          currency: 'USD',
          planId: 'premium_monthly',
        });
      } catch (err) {
        logger.error("Error updating payment status:", err);
        setError("Could not update your payment status. Please contact support.");
      } finally {
        setIsUpdating(false);
      }
    };
    updatePaymentStatus();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user]);

  if (isUpdating) {
    return (
        <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Confirming your payment...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
    );
  }

  if (error) {
     return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">Something Went Wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
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
            <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>_
                <SuccessContent />
            </Suspense>
        </div>
    )
}
