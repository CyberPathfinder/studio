import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VivaFormLogo } from "@/components/icons/logo";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useUser } from "@/firebase/auth";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#recipes", label: "Recipes" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  // We can't use useUser() here directly because Header is a Server Component.
  // We'll handle showing user-specific buttons on the client.
  // This is a placeholder for a real implementation that would likely involve
  // a client component that wraps the buttons.
  const showDashboard = false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2" aria-label="VivaForm Home">
          <VivaFormLogo />
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/60 transition-colors hover:text-foreground/80">
              {link.label}
            </Link>
          ))}
          {showDashboard && (
             <Link href="/dashboard" className="text-foreground/60 transition-colors hover:text-foreground/80">
                Dashboard
             </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="hidden items-center space-x-2 md:flex">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login" aria-label="Log In">Log In</Link>
            </Button>
            <Button asChild variant="gradient">
              <Link href="/quiz" aria-label="Get Started with VivaForm">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate to different sections of the website.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-6 pt-6">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  ))}
                   {showDashboard && (
                     <Link href="/dashboard" className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                        Dashboard
                     </Link>
                  )}
                  <div className="mt-4 flex flex-col gap-4">
                    <Button variant="outline" asChild>
                      <Link href="/login" aria-label="Log In">Log In</Link>
                    </Button>
                    <Button asChild variant="gradient">
                      <Link href="/quiz" aria-label="Get Started with VivaForm">Get Started</Link>
                    </Button>
                     <div className="flex justify-center pt-4">
                       <ThemeToggle />
                     </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
