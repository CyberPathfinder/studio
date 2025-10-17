
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';

const AccessStatusCard = () => {
    const { user, isUserLoading, firestore } = useFirebase();
    const shouldReduceMotion = useReducedMotion();

    const membershipRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}/membership`, 'stripe');
    }, [firestore, user]);

    const { data: membershipData, isLoading: isMembershipLoading } = useDoc(membershipRef);
    
    const hasPremium = membershipData?.tier === 'premium' && membershipData?.active === true;

    const variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    const renderContent = () => {
        if (isUserLoading || isMembershipLoading) {
            return (
                <div className="flex items-center justify-center h-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            );
        }

        if (hasPremium) {
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="gradient" className="text-sm">Premium Access</Badge>
                </div>
            )
        }
        
        return <p className="text-muted-foreground">You are on the free plan.</p>;
    }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={shouldReduceMotion ? {} : variants}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Access Status</CardTitle>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
        {!hasPremium && !isUserLoading && !isMembershipLoading && (
             <CardFooter>
                 <Button asChild className="w-full" variant="gradient">
                    <Link href="/quiz">Upgrade to Premium</Link>
                </Button>
            </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default AccessStatusCard;
