'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MeasurementsCard = ({ intakeData }: { intakeData: any }) => {
  const { measures, preferences } = intakeData;
  const unitWeight = preferences?.unitWeight || 'metric';
  const unitHeight = preferences?.unitHeight || 'metric';

  const displayHeight = unitHeight === 'imperial'
    ? `${Math.floor(measures.height_cm / 2.54 / 12)}'${Math.round((measures.height_cm / 2.54) % 12)}"`
    : `${Math.round(measures.height_cm)} cm`;

  const displayWeight = unitWeight === 'imperial'
    ? `${Math.round(measures.weight_kg * 2.20462)} lbs`
    : `${Math.round(measures.weight_kg)} kg`;
    
  const displayGoalWeight = unitWeight === 'imperial'
    ? `${Math.round(measures.goal_weight_kg * 2.20462)} lbs`
    : `${Math.round(measures.goal_weight_kg)} kg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>My Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Height</p>
              <p className="text-2xl font-bold">{displayHeight}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Weight</p>
              <p className="text-2xl font-bold">{displayWeight}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">BMI</p>
              <p className="text-2xl font-bold">{measures.bmi}</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Goal Weight</p>
              <p className="text-2xl font-bold">{displayGoalWeight}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/quiz/goal-weight">Update Goal</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MeasurementsCard;
