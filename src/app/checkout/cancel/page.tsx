
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, getFirestore, setDoc, serverTimestamp } from 'firebase/firestore';

export default function CancelPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { user } = useFirebase();

    useEffect(() => {
        if (sessionId && user) {
            const updatePaymentStatus = async () => {
                try {
                    const paymentRef = doc(getFirestore(), `users/${user.uid}/payments/${sessionId}`);
                    await setDoc(paymentRef, { status: 'cancelled', updatedAt: serverTimestamp() }, { merge: true });
                } catch (err) {
                    console.error("Error updating payment status to cancelled:", err);
                }
            };
            updatePaymentStatus();
        }
    }, [sessionId, user]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Payment Cancelled</CardTitle>
          <CardDescription>Your order was not processed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have not been charged. You can return to your summary and try again, or explore other options.
          </p>
          <Button asChild className="mt-6">
            <Link href="/quiz">Return to Quiz</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
