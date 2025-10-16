import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle } from "lucide-react";

const FeedbackSection = () => {
  const feedbackImage = PlaceHolderImages.find((image) => image.id === "feedback-system-ui");

  const benefits = [
    "Personalized daily and weekly insights.",
    "Gentle reminders to keep you on track.",
    "Progress reports that celebrate your achievements.",
    "AI-powered suggestions to optimize your diet.",
  ];

  return (
    <section id="feedback" className="py-20 md:py-28">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="order-last lg:order-first">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A Smart Feedback System That Cares
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              VivaForm isn't just about tracking; it's about learning and growing. Our smart feedback system provides the encouragement and insights you need to build lasting healthy habits.
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center">
            {feedbackImage && (
              <Image
                src={feedbackImage.imageUrl}
                alt={feedbackImage.description}
                width={600}
                height={500}
                data-ai-hint={feedbackImage.imageHint}
                className="rounded-xl shadow-2xl transform-gpu transition-all duration-300 hover:scale-105"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedbackSection;
