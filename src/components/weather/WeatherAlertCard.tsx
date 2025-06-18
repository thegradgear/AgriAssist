
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Info, CalendarClock, BookUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export interface NWSWeatherAlert {
  id: string;
  event: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  headline: string;
  description: string;
  instruction?: string;
  sent: string;
  effective: string;
  expires?: string;
  areaDesc: string;
  senderName: string;
}

interface WeatherAlertCardProps {
  alert: NWSWeatherAlert;
}

const severityConfig: Record<NWSWeatherAlert['severity'], { colorClasses: string; icon: JSX.Element }> = {
    Low: { colorClasses: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:border-blue-400 dark:bg-blue-400/10 dark:text-blue-300', icon: <Info className="h-5 w-5" /> },
    Moderate: { colorClasses: 'border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400 dark:bg-yellow-400/10 dark:text-yellow-300', icon: <AlertTriangle className="h-5 w-5" /> },
    High: { colorClasses: 'border-orange-500 bg-orange-500/10 text-orange-700 dark:border-orange-400 dark:bg-orange-400/10 dark:text-orange-300', icon: <AlertTriangle className="h-5 w-5" /> },
    Critical: { colorClasses: 'border-red-600 bg-red-600/10 text-red-700 dark:border-red-500 dark:bg-red-500/10 dark:text-red-400', icon: <AlertTriangle className="h-5 w-5 font-bold" /> },
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
  } catch (e) {
    return dateString; // Fallback to original string if parsing fails
  }
};

export function WeatherAlertCard({ alert }: WeatherAlertCardProps) {
  const config = severityConfig[alert.severity];
  const cardClasses = cn(
    "shadow-md hover:shadow-lg transition-shadow rounded-lg flex flex-col h-full",
    config.colorClasses
  );
  const textColorClass = config.colorClasses.split(' ').find(cls => cls.startsWith('text-')) || 'text-foreground';

  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={cn("flex items-center", textColorClass)}>
            {React.cloneElement(config.icon, { className: cn(config.icon.props.className, "mr-2 shrink-0") })}
            <CardTitle className={cn("text-lg font-headline leading-tight", textColorClass)}>{alert.event}</CardTitle>
          </div>
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap", config.colorClasses.replace(/text-\S+/, '').replace(/border-\S+/, ''), `border ${textColorClass.replace('text-', 'border-')}`)}>
            {alert.severity}
          </span>
        </div>
         <CardDescription className="text-xs pt-1 text-muted-foreground">
          Sent: {formatDate(alert.sent)} by {alert.senderName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-3 pt-0 pb-4">
        <p className="text-sm font-medium leading-snug">{alert.headline}</p>
        
        <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center">
                <CalendarClock className="h-3.5 w-3.5 mr-1.5 shrink-0"/> 
                Effective: {formatDate(alert.effective)}
            </div>
            {alert.expires && (
                <div className="flex items-center">
                    <CalendarClock className="h-3.5 w-3.5 mr-1.5 shrink-0"/> 
                    Expires: {formatDate(alert.expires)}
                </div>
            )}
        </div>

        <p className="text-sm text-muted-foreground"><strong className="font-medium text-current">Areas Affected:</strong> {alert.areaDesc}</p>
        
        <Accordion type="single" collapsible className="w-full text-sm">
          <AccordionItem value="item-1" className="border-b-0">
            {alert.description && (
                <AccordionTrigger className="py-2 text-xs hover:no-underline [&[data-state=open]>svg]:text-primary">
                    Show Full Description
                </AccordionTrigger>
            )}
            <AccordionContent className="pt-1 pb-0">
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line overflow-y-auto max-h-60 p-2 border rounded-md bg-background/50">
                {alert.description}
              </div>
            </AccordionContent>
          </AccordionItem>
          {alert.instruction && (
            <AccordionItem value="item-2" className="border-b-0">
                 <AccordionTrigger className="py-2 text-xs hover:no-underline [&[data-state=open]>svg]:text-primary">
                    Show Instructions
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line overflow-y-auto max-h-60 p-2 border rounded-md bg-background/50">
                    {alert.instruction}
                  </div>
                </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}

    