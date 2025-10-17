
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

const AccessStatusCard = () => {
    // In a real app, you would fetch payment status here
    const hasPremium = true;
    const shouldReduceMotion = useReducedMotion();

    const variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

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
            {hasPremium ? (
                <p className="text-lg font-semibold text-primary">Premium Access</p>
            ) : (
                <p className="text-muted-foreground">You are on the free plan.</p>
            )}
        </CardContent>
        <CardFooter>
            {!hasPremium && (
                 <Button asChild className="w-full">
                    <Link href="/pricing">Upgrade to Premium</Link>
                </Button>
            )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AccessStatusCard;
