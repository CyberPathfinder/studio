import { Camera, Mic, ScanBarcode, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: <Camera className="h-10 w-10 text-primary" />,
    title: "Photo Logging",
    description: "Snap a photo of your meal and let our AI analyze it for you.",
  },
  {
    icon: <ScanBarcode className="h-10 w-10 text-primary" />,
    title: "Barcode Scanning",
    description: "Instantly get nutrition facts by scanning the barcode on any product.",
  },
  {
    icon: <Mic className="h-10 w-10 text-primary" />,
    title: "Voice Entry",
    description: "Simply say what you ate and we'll log it. It's that easy.",
  },
  {
    icon: <Search className="h-10 w-10 text-primary" />,
    title: "Manual Search",
    description: "Our vast food database makes it simple to find and log any item.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Effortless Food Tracking
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We believe tracking your nutrition should be simple and intuitive. That's why we've built multiple ways for you to log your meals, your way.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              <CardHeader className="items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
