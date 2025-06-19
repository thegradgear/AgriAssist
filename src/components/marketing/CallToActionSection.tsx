
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function CallToActionSection() {
  return (
    <section id="cta" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold leading-tight font-headline text-foreground mb-6 md:text-3xl"> {/* H2: text-2xl font-semibold, or text-3xl for emphasis */}
          Ready to Elevate Your Farming?
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto"> {/* Large Body for description */}
          Join thousands of farmers benefiting from AgriAssist. Sign up for free and gain access to AI-powered tools designed to boost your productivity and profitability.
        </p>
        <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 px-8 py-3 text-base">
          <Link href="/signup">Start Your Smart Farming Journey</Link>
        </Button>
      </div>
    </section>
  );
}
