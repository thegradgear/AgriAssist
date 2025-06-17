import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CloudRain, ThermometerSun, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WeatherAlert {
  id: string;
  type: 'Extreme Heat' | 'Heavy Rainfall' | 'Strong Winds' | 'Frost Warning' | 'General Alert';
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  title: string;
  description: string;
  advice: string;
  timestamp: string; 
}

interface WeatherAlertCardProps {
  alert: WeatherAlert;
}

const alertIcons: Record<WeatherAlert['type'], LucideIcon> = {
  'Extreme Heat': ThermometerSun,
  'Heavy Rainfall': CloudRain,
  'Strong Winds': Wind,
  'Frost Warning': AlertTriangle, // Placeholder, ideally a snowflake or frost icon
  'General Alert': AlertTriangle,
};

const severityColors: Record<WeatherAlert['severity'], string> = {
    Low: 'border-blue-500 bg-blue-500/10 text-blue-700',
    Moderate: 'border-yellow-500 bg-yellow-500/10 text-yellow-700',
    High: 'border-orange-500 bg-orange-500/10 text-orange-700',
    Critical: 'border-red-600 bg-red-600/10 text-red-700',
};

export function WeatherAlertCard({ alert }: WeatherAlertCardProps) {
  const Icon = alertIcons[alert.type] || AlertTriangle;
  const cardClasses = cn(
    "shadow-md hover:shadow-lg transition-shadow",
    severityColors[alert.severity]
  );
  const iconClasses = cn("h-6 w-6", severityColors[alert.severity].split(' ')[2]); // Get text color for icon

  // Format timestamp for display
  let displayTime = 'Recently';
  try {
    const date = new Date(alert.timestamp);
    if (!isNaN(date.getTime())) {
      displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
    }
  } catch (e) { /* ignore, use default */ }


  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-xl font-headline flex items-center", severityColors[alert.severity].split(' ')[2])}>
            <Icon className={cn("mr-2", iconClasses)} />
            {alert.title}
          </CardTitle>
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", severityColors[alert.severity].split(' ')[1])}>
            {alert.severity}
          </span>
        </div>
        <CardDescription className="text-xs pt-1">{displayTime}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm">{alert.description}</p>
        <h4 className="font-semibold text-sm mb-1">Advice:</h4>
        <p className="text-sm text-muted-foreground">{alert.advice}</p>
      </CardContent>
    </Card>
  );
}
