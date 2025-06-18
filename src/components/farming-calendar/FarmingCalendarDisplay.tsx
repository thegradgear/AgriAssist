'use client';

import type { FarmingCalendarOutput, CalendarEvent } from '@/ai/flows/farming-calendar-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription, TimelineBody } from '@/components/shared/Timeline'; // Assuming a generic Timeline component
import { CalendarCheck, Info, AlertTriangle, Sparkles, MessageSquare, Loader2, ListChecks } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface FarmingCalendarDisplayProps {
  result: FarmingCalendarOutput | null;
  loading: boolean;
  error: string | null;
}

const getCategoryIcon = (category: CalendarEvent['category']) => {
  switch (category) {
    case 'Preparation': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.25 7.75H2.75"/><path d="M18 7.75V2.25H6V7.75"/><path d="M12 21.75V7.75"/><path d="M16.5 21.75C16.5 19.53 14.47 17.75 12 17.75C9.53 17.75 7.5 19.53 7.5 21.75"/></svg>; // Shovel icon
    case 'Planting': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h.01"/><path d="M11.5 6.5a5.5 5.5 0 0 1 5.21 8.35l-7.71 7.15H6.5a1.5 1.5 0 0 1 0-3H8"/><path d="M17 6.5c-.3 1.8-.81 3.48-1.5 5C14.19 14.52 12.5 16 10 16.5"/></svg>; // Sprout icon
    case 'Fertilization': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>; // Shield-check (nutrients)
    case 'Irrigation': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 12a3 3 0 0 0-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3a3 3 0 0 0-3-3z"/></svg>; // Droplet icon
    case 'Pest & Disease Management': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9.87 9.87 0 0 0-7.07 2.93 9.87 9.87 0 0 0-2.93 7.07v0c0 5.57 6.13 11.19 7.07 12 1.35 1.19 2.52.54 2.93.21.41-.33 1.58-.96 2.93-2.19.94-.81 7.07-6.43 7.07-12A9.87 9.87 0 0 0 19.07 4.93 9.87 9.87 0 0 0 12 2z"/><path d="M12 6a3 3 0 1 0 0 6 3 3 0 1 0 0-6z"/></svg>; // Bug icon
    case 'Weed Control': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M12 2v6"/><path d="M9.4 6 5.7 2.3A1.89 1.89 0 0 0 2.3 5.7L6 9.4"/><path d="m14.6 6 3.7-3.7A1.89 1.89 0 0 1 21.7 5.7L18 9.4"/></svg>; // Scissors for pruning/weeding
    case 'Harvesting': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"/><path d="M18.88 3.12a1.53 1.53 0 0 0-2.17 0L9.41 10.4a.5.5 0 0 0 0 .7l4.95 4.95a.5.5 0 0 0 .7 0l7.3-7.3a1.53 1.53 0 0 0 0-2.17Z"/><path d="M15.41 6.12 11.46 2.17a1.41 1.41 0 0 0-2.05 0L2.11 9.48a2.13 2.13 0 0 0 0 3l1.83 1.83c.58.58 1.36.88 2.12.88H8"/></svg>; // Sickle/Scythe
    case 'Post-Harvest': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; // Warehouse/Storage
    default: return <ListChecks className="w-4 h-4" />;
  }
};

const formatDateRange = (startDateStr: string, endDateStr?: string) => {
  try {
    const startDate = parseISO(startDateStr);
    let dateText = format(startDate, "MMM d, yyyy");
    if (endDateStr) {
      const endDate = parseISO(endDateStr);
      if (format(startDate, "yyyy-MM-dd") !== format(endDate, "yyyy-MM-dd")) {
         dateText += ` - ${format(endDate, "MMM d, yyyy")}`;
      }
    }
    return dateText;
  } catch (e) {
    console.error("Date parsing/formatting error:", e);
    return `${startDateStr}${endDateStr ? ' - ' + endDateStr : ''}`;
  }
};


export function FarmingCalendarDisplay({ result, loading, error }: FarmingCalendarDisplayProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-7 bg-muted rounded w-3/5 mb-2"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </CardHeader>
        <CardContent className="space-y-5">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-16 w-0.5 bg-muted my-1"></div>
                </div>
                <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                </div>
            </div>
          ))}
          <div className="h-10 bg-muted rounded w-full mt-3"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
        <Card className="shadow-lg border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="font-headline flex items-center text-destructive">
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    Error Generating Calendar
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive" className="border-0">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  if (!result || !result.schedule || result.schedule.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <CalendarCheck className="mr-2 h-6 w-6 text-primary" />
            Farming Schedule
          </CardTitle>
          <CardDescription>Your personalized farming calendar will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Info className="mx-auto h-12 w-12 mb-3" />
            <p>Enter details in the form to generate your farming schedule.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <CalendarCheck className="mr-2 h-6 w-6 text-primary" />
          Farming Calendar for {result.cropName}
        </CardTitle>
        <CardDescription>
          Location: {result.location} | Approx. Planting: {formatDateRange(result.plantingDate)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {result.schedule.length > 0 && (
          <Timeline>
            {result.schedule.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineConnector />
                <TimelineHeader>
                  <TimelineIcon>{getCategoryIcon(event.category)}</TimelineIcon>
                  <TimelineTitle>{event.eventName}</TimelineTitle>
                </TimelineHeader>
                <TimelineBody className="ml-2">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {formatDateRange(event.startDate, event.endDate)} ({event.category})
                  </p>
                  <p className="text-sm">{event.description}</p>
                </TimelineBody>
              </TimelineItem>
            ))}
          </Timeline>
        )}

        {result.generalAdvice && (
          <Alert variant="default" className="mt-6 bg-accent/50 border-accent">
            <MessageSquare className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">General Advice</AlertTitle>
            <AlertDescription className="text-sm whitespace-pre-line">{result.generalAdvice}</AlertDescription>
          </Alert>
        )}

        <Alert variant="default" className="mt-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold text-primary">Disclaimer</AlertTitle>
          <AlertDescription className="text-xs">
            This farming calendar is AI-generated and provides general guidance. Actual timings may vary based on specific micro-climatic conditions, soil health, pest/disease pressure, and chosen crop variety. Always adapt to your local conditions and consult with local agricultural experts.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
