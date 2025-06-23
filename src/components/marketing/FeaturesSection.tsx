
'use client';

import { BarChart3, Leaf, Droplets, BookOpen, Microscope, IndianRupee, CalendarDays, Calculator, CloudSun } from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const appFeatures = [
  {
    icon: BarChart3,
    title: 'Yield Prediction',
    description: 'Forecast crop yields with high accuracy using historical and regional data to plan effectively.',
  },
  {
    icon: Leaf,
    title: 'Crop Recommendation',
    description: 'Get tailored crop suggestions based on your specific soil health and local weather conditions.',
  },
  {
    icon: IndianRupee,
    title: 'Price Prediction',
    description: 'Estimate future market prices and compare with MSP to make informed selling decisions.',
  },
  {
    icon: Microscope,
    title: 'Crop Health Analysis',
    description: 'Upload crop images to quickly identify diseases, pests, or weeds and receive AI-driven advice.',
  },
  {
    icon: CalendarDays,
    title: 'Farming Calendar',
    description: 'Generate a personalized schedule for all crucial farming activities, from planting to harvest.',
  },
  {
    icon: Droplets,
    title: 'Irrigation Management',
    description: 'Receive optimal 5-day watering schedules based on your crop, soil, and weather forecast.',
  },
  {
    icon: Calculator,
    title: 'Cost Calculator',
    description: 'Estimate your cultivation costs, analyze potential profit, and calculate break-even points.',
  },
  {
    icon: CloudSun,
    title: 'Weather Alerts',
    description: 'Access detailed current, hourly, and 5-day weather forecasts to protect your crops.',
  },
  {
    icon: BookOpen,
    title: 'Best Practices',
    description: 'Stay updated with the latest farming techniques and innovations through our curated news library.',
  },
];

export function FeaturesSection() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
    
    setCurrent(api.selectedScrollSnap())
    
    const onSelect = (api: CarouselApi) => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)
    
    return () => {
      api.off("select", onSelect)
    }
  }, [api])


  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl font-semibold leading-tight font-headline text-foreground">
            A Suite of Tools for <span className="text-primary">Modern Agriculture</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            AgriAssist brings cutting-edge technology to your fingertips, simplifying complex farming challenges.
          </p>
        </div>
        <Carousel 
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {appFeatures.map((feature, index) => (
              <CarouselItem key={index} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1 h-full">
                    <FeatureCard
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 z-10 bg-background/50 hover:bg-background hover:text-primary" />
          <CarouselNext className="right-2 z-10 bg-background/50 hover:bg-background hover:text-primary" />
        </Carousel>
        <div className="flex items-center justify-center gap-2 mt-8">
          {appFeatures.map((_, index) => (
            <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    index === current ? "w-4 bg-primary" : "bg-muted-foreground/50 hover:bg-muted-foreground"
                )}
                aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
