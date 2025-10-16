import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VivaFormLogo } from "@/components/icons/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <VivaFormLogo className="h-8 w-auto" />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="#">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="#">Get Started</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
