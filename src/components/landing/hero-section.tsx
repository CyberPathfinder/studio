import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const heroImage = PlaceHolderImages.find((image) => image.id === "hero-app-ui");

  return (
    <section className="relative w-full overflow-hidden pt-20 md:pt-28 lg:pt-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Wellness Within Reach
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Effortlessly track food, find healthy recipes, and reach your wellness goals.
            </p>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="#" aria-label="Get Started for Free">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="#" aria-label="Learn More about VivaForm">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative animate-in fade-in slide-in-from-bottom-12 duration-500">
              <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-[2.5rem] h-[550px] w-[270px] shadow-2xl shadow-primary/20 -rotate-3">
                <div className="w-[140px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[40px] w-[3px] bg-gray-800 absolute -left-[11px] top-[100px] rounded-l-lg"></div>
                <div className="h-[40px] w-[3px] bg-gray-800 absolute -left-[11px] top-[150px] rounded-l-lg"></div>
                <div className="h-[55px] w-[3px] bg-gray-800 absolute -right-[11px] top-[120px] rounded-r-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white">
                  {heroImage && (
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      width={320}
                      height={640}
                      data-ai-hint={heroImage.imageHint}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
