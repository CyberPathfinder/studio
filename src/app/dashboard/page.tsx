'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProfileCard from '@/components/dashboard/ProfileCard';
import MeasurementsCard from '@/components/dashboard/MeasurementsCard';
import AccessStatusCard from '@/components/dashboard/AccessStatusCard';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const intakeRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/intake/initial`);
  }, [user, firestore]);

  const { data: intakeData, isLoading: isIntakeLoading } = useDoc(intakeRef);

  if (isUserLoading || isIntakeLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!intakeData) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to your Dashboard!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              You haven't completed your intake quiz yet. Complete the quiz to get your personalized plan.
            </p>
            <Button asChild>
              <Link href="/quiz">Start My Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your wellness journey.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <ProfileCard user={user} />
        <MeasurementsCard intakeData={intakeData} />
        <AccessStatusCard />
      </div>
    </div>
  );
}
