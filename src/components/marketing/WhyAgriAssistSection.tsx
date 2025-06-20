
import { BrainCircuit, AppWindow, Layers3, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';

interface BenefitPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

const whyPoints: BenefitPoint[] = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Precision',
    description: 'Leverage cutting-edge AI for accurate predictions, personalized recommendations, and smarter farming decisions tailored to your needs.',
  },
  {
    icon: AppWindow,
    title: 'User-Friendly Interface',
    description: 'Access powerful tools through an intuitive and easy-to-navigate platform, designed for farmers of all tech levels, on any device.',
  },
  {
    icon: Layers3,
    title: 'Comprehensive Toolkit',
    description: 'From yield forecasting to disease detection and market pricing, AgriAssist offers a complete suite of solutions in one convenient place.',
  },
  {
    icon: TrendingUp,
    title: 'Data-Driven Insights',
    description: 'Make informed choices based on data analytics, helping you optimize resources, reduce risks, and ultimately increase your farm\'s profitability.',
  },
];

export function WhyAgriAssistSection() {
  return (
    <section id="why-agriassist" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl font-semibold leading-tight font-headline text-foreground">
            Why Choose <span className="text-primary">AgriAssist?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Unlock the full potential of your farm with intelligent tools designed for modern Indian agriculture, helping you save time, reduce costs, and improve yields.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden shadow-xl order-last md:order-first animate-fade-in-right">
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Farmer benefiting from AgriAssist insights" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="modern agriculture technology"
              className="rounded-xl"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          <div className="max-w-xl mx-auto md:mx-0">
            <ul className="space-y-8">
              {whyPoints.map((point, index) => (
                <li key={point.title} className="flex items-start animate-fade-in-up" style={{ animationDelay: `${index * 150 + 50}ms` }}>
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                      <point.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium leading-snug text-foreground font-headline">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-normal">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
