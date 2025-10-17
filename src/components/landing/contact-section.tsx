
import { Mail, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get in Touch
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Have questions? We're here to help. Reach out to our team or browse our frequently asked questions.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild variant="outline">
              <a href="mailto:support@vivaform.com">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </a>
            </Button>
            <Button size="lg" asChild variant="ghost">
              <a href="#">
                <HelpCircle className="mr-2 h-5 w-5" />
                Visit FAQ
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
