import Link from "next/link";
import { Button } from "../ui/button";

const CtaSection = () => {
  return (
    <section id="cta" className="py-20 md:py-28">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary/10 p-12 text-center shadow-lg">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            Ready to Start Your Journey?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Join thousands of others who are transforming their health one meal at a time. Sign up for free and take the first step towards a better you.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="#">Take the First Step</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
