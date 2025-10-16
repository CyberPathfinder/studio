import { cn } from "@/lib/utils";

export const VivaFormLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="156"
    height="40"
    viewBox="0 0 156 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("text-foreground", className)}
    {...props}
  >
    <path
      d="M27.3157 8.33331C28.4116 3.48331 34.6133 0.166641 38.3333 4.49998C42.0533 8.83331 40.5884 16.3333 35.4925 20.3333C30.3966 24.3333 24.5884 24.3333 21.0852 20.3333C24.5884 24.3333 25.1364 29.8333 22.997 34.1666C20.8576 38.4999 15.6364 39.8333 12.3333 36.1666C9.03028 32.4999 9.22725 26.1666 12.3333 22.1666C9.22725 26.1666 5.85755 29.3333 1.66666 30.1666"
      stroke="hsl(var(--primary))"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="45"
      y="30"
      className="font-headline"
      fontSize="30"
      fontWeight="700"
      fill="currentColor"
    >
      VivaForm
    </text>
  </svg>
);
