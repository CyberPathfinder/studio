import CtaSection from "@/components/landing/cta-section";
import FeaturesSection from "@/components/landing/features-section";
import FeedbackSection from "@/components/landing/feedback-section";
import HeroSection from "@/components/landing/hero-section";
import RecipesSection from "@/components/landing/recipes-section";
import TestimonialsSection from "@/components/landing/testimonials-section";

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <RecipesSection />
      <FeedbackSection />
      <TestimonialsSection />
      <CtaSection />
    </div>
  );
}
