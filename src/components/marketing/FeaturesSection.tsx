
import { BarChart3, Leaf, CloudSun, BookOpen, Microscope, DollarSign, CalendarDays, Calculator } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const appFeatures = [
  {
    icon: BarChart3,
    title: 'AI Yield Prediction',
    description: 'Forecast crop yields with high accuracy using advanced AI, helping you plan effectively for the upcoming season.',
  },
  {
    icon: Leaf,
    title: 'Smart Crop Choices',
    description: 'Receive tailored crop recommendations based on your soil data, local climate, and market demands.',
  },
  {
    icon: DollarSign,
    title: 'Price Forecasting',
    description: 'Estimate future market prices for your crops, empowering you to make informed selling decisions.',
  },
  {
    icon: Microscope,
    title: 'Plant Disease Detection',
    description: 'Upload crop images to quickly identify potential diseases and receive AI-driven management advice.',
  },
  {
    icon: CalendarDays,
    title: 'Personalized Farming Calendar',
    description: 'Get a custom schedule for all crucial farming activities, from planting to harvest, tailored to your crop.',
  },
  {
    icon: Calculator,
    title: 'Farming Cost Calculator',
    description: 'Estimate your cultivation costs and analyze potential profit margins for better financial planning.',
  },
  {
    icon: CloudSun,
    title: 'Timely Weather Insights',
    description: 'Access current weather information and alerts to protect your crops and optimize irrigation schedules.',
  },
  {
    icon: BookOpen,
    title: 'Agricultural Articles & News',
    description: 'Stay updated with the latest farming techniques, innovations, and news through our curated library.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl font-semibold leading-tight font-headline text-foreground"> {/* H2: text-2xl, font-semibold, leading-tight */}
            A Suite of Tools for <span className="text-primary">Modern Agriculture</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"> {/* Large Body for description */}
            AgriAssist brings cutting-edge technology to your fingertips, simplifying complex farming challenges.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {appFeatures.map((feature, index) => (
            <div key={feature.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
