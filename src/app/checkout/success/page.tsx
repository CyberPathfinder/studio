
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useFirebase();
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    if (sessionId && user) {
      const updatePaymentStatus = async () => {
        try {
          const paymentRef = doc(getFirestore(), `users/${user.uid}/payments/${sessionId}`);
          await setDoc(paymentRef, { status: 'success', updatedAt: serverTimestamp() }, { merge: true });
        } catch (err) {
          console.error("Error updating payment status:", err);
          setError("Could not update your payment status. Please contact support.");
        } finally {
          setIsUpdating(false);
        }
      };
      updatePaymentStatus();
    } else {
        setIsUpdating(false);
        if (!sessionId) setError("No session ID found.");
        if (!user) setError("You must be logged in to confirm a payment.");
    }
  }, [sessionId, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Payment Successful!</CardTitle>
          <CardDescription>Thank you for your purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          {isUpdating ? (
            <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Confirming your payment...</span>
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your premium access is now active. A confirmation has been sent to your email.
            </p>
          )}
          <Button asChild className="mt-6">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">Session ID: {sessionId}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <SuccessContent />
        </Suspense>
    )
}
