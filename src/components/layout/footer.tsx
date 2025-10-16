import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { VivaFormLogo } from "@/components/icons/logo";
import { Button } from "../ui/button";

export function Footer() {
  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Linkedin, href: "#", name: "LinkedIn" },
  ];

  const footerLinks = [
    { href: "#features", name: "Features" },
    { href: "#recipes", name: "Recipes" },
    { href: "#pricing", name: "Pricing" },
    { href: "#contact", name: "Contact" },
    { href: "#", name: "Privacy Policy" },
    { href: "#", name: "Terms of Service" },
  ];

  return (
    <footer className="bg-white">
      <div className="container py-12 lg:py-16">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center md:items-start">
            <VivaFormLogo className="h-10 w-auto text-primary" />
            <p className="mt-4 max-w-xs text-center text-muted-foreground md:text-left">
              Your partner in achieving wellness and a healthier lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-3 md:text-left">
            <div>
              <h3 className="font-headline font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.slice(0, 4).map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.slice(4).map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-muted-foreground hover:text-primary">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-foreground">Social</h3>
              <div className="mt-4 flex justify-center space-x-4 md:justify-start">
                {socialLinks.map((link) => (
                  <Button variant="ghost" size="icon" asChild key={link.name}>
                    <a href={link.href} aria-label={link.name}>
                      <link.icon className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} VivaForm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
