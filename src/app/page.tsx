import CtaSection from "@/components/landing/cta-section";
import FeaturesSection from "@/components/landing/features-section";
import FeedbackSection from "@/components/landing/feedback-section";
import HeroSection from "@/components/landing/hero-section";
import PricingSection from "@/components/landing/pricing-section";
import ContactSection from "@/components/landing/contact-section";
import RecipesSection from "@/components/landing/recipes-section";
import TestimonialsSection from "@/components/landing/testimonials-section";

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <RecipesSection />
      <FeedbackSection />
      <PricingSection />
      <TestimonialsSection />
      <ContactSection />
      <CtaSection />
    </div>
  );
}
