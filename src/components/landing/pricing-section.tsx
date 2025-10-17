
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Check } from 'lucide-react';

const pricingPlans = [
    {
        name: 'Free',
        price: '$0',
        period: '/ month',
        description: 'Get started with our basic features.',
        features: [
            'Basic food tracking',
            'Limited recipe access',
            'Community support'
        ],
        cta: 'Get Started',
        ctaLink: '/quiz',
        variant: 'outline' as const
    },
    {
        name: 'Premium',
        price: '$10',
        period: '/ month',
        description: 'Unlock the full potential of VivaForm.',
        features: [
            'Advanced AI-powered logging',
            'Unlimited recipe library',
            'Personalized meal plans',
            'Smart feedback & insights',
            'Priority support'
        ],
        cta: 'Go Premium',
        ctaLink: '/quiz',
        variant: 'gradient' as const,
        recommended: true
    }
];

const PricingSection = () => {
    return (
        <section id="pricing" className="py-20 md:py-28 bg-white">
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-16 max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Find the Plan That’s Right for You
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Simple, transparent pricing. Choose the plan that fits your wellness journey.
                    </p>
                </div>
                <div className="mx-auto grid max-w-md gap-8 lg:max-w-4xl lg:grid-cols-2">
                    {pricingPlans.map((plan) => (
                        <Card key={plan.name} className={plan.recommended ? 'shadow-2xl ring-2 ring-primary' : 'shadow-lg'}>
                            <CardHeader>
                                <CardTitle className='font-headline text-2xl'>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                                <ul className="space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center">
                                            <Check className="mr-2 h-5 w-5 text-primary" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full" variant={plan.variant}>
                                    <Link href={plan.ctaLink}>{plan.cta}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default PricingSection;
