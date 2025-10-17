
'use client';

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProfileCard from '@/components/dashboard/ProfileCard';
import MeasurementsCard from '@/components/dashboard/MeasurementsCard';
import AccessStatusCard from '@/components/dashboard/AccessStatusCard';
import SmartFeedbackCard from '@/components/dashboard/SmartFeedbackCard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const GuestUserBanner = () => (
    <Alert className="mb-8 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
        <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-300" />
        <AlertTitle>You are viewing as a guest.</AlertTitle>
        <AlertDescription>
            Your progress is saved on this device, but to access it anywhere and unlock all features, please create a free account.
            <Button asChild variant="link" className="p-0 h-auto ml-1 text-blue-700 dark:text-blue-300">
                <Link href="/signup">Create an account</Link>
            </Button>
        </AlertDescription>
    </Alert>
)

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  // Redirect to login if auth is done and there's no user.
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  // The useMemoFirebase hook correctly waits for `user` and `firestore` to be available.
  // If they are not, it returns `null`, and `useDoc` will wait.
  const intakeRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `users/${user.uid}/intake/initial`);
  }, [user, firestore]);

  const { data: intakeData, isLoading: isIntakeLoading, error: intakeError } = useDoc(intakeRef);

  // Show a loader while authentication is in progress or the initial fetch is happening.
  if (isUserLoading || (isIntakeLoading && !intakeError)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle permission errors gracefully.
  if (intakeError) {
     return (
        <div className="container mx-auto max-w-5xl py-12 px-4 text-center">
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                We couldn't load your dashboard data due to a permission issue. Please try signing out and back in. If the problem persists, contact support.
              </AlertDescription>
            </Alert>
        </div>
    );
  }
  
  // Handle the case where the intake document doesn't exist (not-found).
  // This is a normal state for a new user.
  if (!intakeData) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Welcome to your Dashboard!</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
              Let's get started on your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              You haven't completed your intake quiz yet. Complete the quiz to unlock your personalized plan and dashboard.
            </p>
            <Button size="lg" asChild variant="gradient">
              <Link href="/quiz">Start My Free Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8">
        {user?.isAnonymous && <GuestUserBanner />}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Your Dashboard</h1>
        <p className="text-muted-foreground">Here's an overview of your wellness journey.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <ProfileCard user={user!} />
          <AccessStatusCard />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <MeasurementsCard intakeData={intakeData} />
          <SmartFeedbackCard bmi={intakeData.measures.bmi} intakeData={intakeData} />
        </div>
      </div>
    </div>
  );
}

    