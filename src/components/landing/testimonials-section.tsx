import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const testimonials = [
  {
    id: "testimonial-1",
    name: "Jane D.",
    role: "Fitness Enthusiast",
    quote: "VivaForm has completely changed how I approach my diet. It's so intuitive and the recipes are amazing! I've never felt better.",
  },
  {
    id: "testimonial-2",
    name: "John S.",
    role: "Busy Professional",
    quote: "As someone with a hectic schedule, voice logging is a lifesaver. This app fits perfectly into my life and keeps me accountable.",
  },
  {
    id: "testimonial-3",
    name: "Sarah L.",
    role: "Wellness Coach",
    quote: "I recommend VivaForm to all my clients. The smart feedback is gentle yet effective, and it genuinely helps build sustainable habits.",
  },
  {
    id: "testimonial-4",
    name: "Mike C.",
    role: "Marathon Runner",
    quote: "The detailed nutritional breakdown is exactly what I need for my training. VivaForm is an essential tool in my performance arsenal.",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="bg-white py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Loved by Users Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our community is saying about their journey with VivaForm.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => {
              const image = PlaceHolderImages.find((img) => img.id === testimonial.id);
              return (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex h-full flex-col justify-between p-6">
                        <p className="text-muted-foreground">"{testimonial.quote}"</p>
                        <div className="mt-6 flex items-center">
                          {image && (
                            <Image
                              src={image.imageUrl}
                              alt={`Avatar of ${testimonial.name}`}
                              width={48}
                              height={48}
                              data-ai-hint={image.imageHint}
                              className="h-12 w-12 rounded-full"
                            />
                          )}
                          <div className="ml-4">
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
