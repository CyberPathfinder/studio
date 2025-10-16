import { Camera, Mic, ScanBarcode, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
  {
    icon: <Camera className="h-6 w-6 text-primary" />,
    title: "Photo Logging",
    description: "Just snap a photo of your meal. Our AI will handle the rest for you.",
  },
  {
    icon: <ScanBarcode className="h-6 w-6 text-primary" />,
    title: "Barcode Scanning",
    description: "Quickly scan any product's barcode to instantly see its full nutritional information.",
  },
  {
    icon: <Mic className="h-6 w-6 text-primary" />,
    title: "Voice Entry",
    description: "On the go? Simply say what you ate, and we'll log it for you. It's that easy.",
  },
  {
    icon: <Search className="h-6 w-6 text-primary" />,
    title: "Manual Search",
    description: "Find anything you're looking for in our huge database of foods and drinks.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container px-4 sm:px-6 lg:px-8">
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
            <Card key={index} className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-lg shadow-md">
              <CardHeader className="items-center text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                <CardDescription className="mt-2 h-16">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
