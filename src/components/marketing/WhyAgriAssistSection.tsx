
import { BrainCircuit, AppWindow, Layers3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BenefitPointProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const BenefitPointCard = ({ icon: Icon, title, description }: BenefitPointProps) => {
  return (
    <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1 transform">
      <CardHeader className="items-center text-center pt-6 pb-4">
        <div className="p-3 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6 text-center flex-grow">
        <p className="text-sm text-muted-foreground leading-normal">{description}</p>
      </CardContent>
    </Card>
  );
};

const whyPoints = [
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {whyPoints.map((point, index) => (
            <div key={point.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100 + 50}ms` }}>
              <BenefitPointCard
                icon={point.icon}
                title={point.title}
                description={point.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
