
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section id="hero" className="min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-68px)] flex items-center bg-gradient-to-br from-background via-muted/30 to-background pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8 text-center md:text-left animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight text-foreground">
              Smart Farming, <span className="text-primary">Simplified.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
              AgriAssist provides AI-powered tools for Indian farmers. Get precise yield predictions, intelligent crop recommendations, real-time price forecasts, disease detection, personalized farming calendars, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <Button size="lg" asChild className="shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105">
                <Link href="/signup">
                  Join AgriAssist Today <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover:bg-primary/10 hover:border-primary transition-all duration-300">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-72 md:h-[450px] rounded-xl overflow-hidden shadow-2xl animate-fade-in-right order-first md:order-last">
            <Image 
              src="https://placehold.co/700x500.png" 
              alt="Farmer using AgriAssist technology in a field" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="indian farmer technology"
              priority
              className="transform group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
