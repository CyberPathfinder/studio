"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Apple, Activity, Soup } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

const PhoneScreenHome = () => (
  <div className="p-4 space-y-4 bg-background">
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Daily Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Calories</span>
          <span className="font-medium">1800 / 2200 kcal</span>
        </div>
        <Progress value={82} className="h-2" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Macros</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-bold text-base">150g</p>
          <p className="text-muted-foreground">Protein</p>
        </div>
        <div>
          <p className="font-bold text-base">200g</p>
          <p className="text-muted-foreground">Carbs</p>
        </div>
        <div>
          <p className="font-bold text-base">60g</p>
          <p className="text-muted-foreground">Fat</p>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="text-center">
          <Activity className="h-6 w-6 mx-auto text-primary" />
          <p className="text-xs mt-1">Home</p>
        </div>
        <div className="text-center">
          <Apple className="h-6 w-6 mx-auto text-muted-foreground" />
          <p className="text-xs mt-1">Log</p>
        </div>
        <div className="text-center">
          <Soup className="h-6 w-6 mx-auto text-muted-foreground" />
          <p className="text-xs mt-1">Recipes</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden pt-20 md:pt-28 lg:pt-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#E8FBF4] via-[#F9FCFB] to-[#F3FAFA] -z-10"></div>
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Wellness Within Reach
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Effortlessly track food, find healthy recipes, and reach your wellness goals.
            </p>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" asChild className="w-full sm:w-auto" variant="gradient">
                <Link href="/quiz" aria-label="Get Started for Free">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#" aria-label="Learn More about VivaForm">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
             <div className="relative mx-auto border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-gray-800 border-[8px] rounded-[2.5rem] h-[550px] w-[270px] shadow-2xl drop-shadow-2xl -rotate-3">
                <div className="w-[140px] h-[18px] bg-gray-200 dark:bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[40px] w-[3px] bg-gray-200 dark:bg-gray-800 absolute -left-[11px] top-[100px] rounded-l-lg"></div>
                <div className="h-[40px] w-[3px] bg-gray-200 dark:bg-gray-800 absolute -left-[11px] top-[150px] rounded-l-lg"></div>
                <div className="h-[55px] w-[3px] bg-gray-200 dark:bg-gray-800 absolute -right-[11px] top-[120px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative">
                  <PhoneScreenHome />
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
