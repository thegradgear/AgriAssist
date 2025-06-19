
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group hover:-translate-y-1 transform">
      <CardHeader className="items-center text-center pt-6 pb-4">
        <div className="p-3 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        {/* CardTitle styling is now applied globally via ui/card.tsx based on H4 guideline */}
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-6 text-center flex-grow">
        {/* CardDescription styling is text-sm text-muted-foreground leading-normal (from ui/card.tsx) */}
        <CardDescription>
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
