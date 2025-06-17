import { BarChart3, Leaf, CloudSun, BookOpen } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: BarChart3,
    title: 'AI Yield Prediction',
    description: 'Leverage advanced AI models to get accurate crop yield forecasts for better planning and decision-making.',
  },
  {
    icon: Leaf,
    title: 'Smart Crop Recommendation',
    description: 'Receive personalized crop suggestions based on your soil data, local weather patterns, and market trends.',
  },
  {
    icon: CloudSun,
    title: 'Timely Weather Alerts',
    description: 'Stay ahead of adverse weather conditions with real-time alerts and actionable advice to protect your crops.',
  },
  {
    icon: BookOpen,
    title: 'Best Practices Library',
    description: 'Access a curated collection of articles, guides, and videos on modern and sustainable farming techniques.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-headline">Why Choose <span className="text-primary">AgriAssist</span>?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need for smarter, more productive farming, all in one place.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
