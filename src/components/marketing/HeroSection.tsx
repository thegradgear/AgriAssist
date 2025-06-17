import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
            Empowering Indian Farmers with <span className="text-primary">Intelligent Agri-Tech</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Get AI-driven insights for crop yield prediction, personalized recommendations, and timely weather alerts. Join AgriAssist and revolutionize your farming practices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-shadow">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-xl">
           <Image 
            src="https://placehold.co/600x400.png" 
            alt="Modern farming technology" 
            layout="fill" 
            objectFit="cover"
            data-ai-hint="farming technology"
            className="transform hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
}
