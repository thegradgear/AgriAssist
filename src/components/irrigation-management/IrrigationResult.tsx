
'use client';

import type { IrrigationScheduleOutput } from '@/ai/flows/irrigation-schedule-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription, TimelineBody } from '@/components/shared/Timeline';
import { Droplets, Info, AlertTriangle, Sparkles, CloudSun, X, Check } from 'lucide-react';

interface IrrigationResultProps {
  result: IrrigationScheduleOutput | null;
  loading: boolean;
  error: string | null;
}

export function IrrigationResult({ result, loading, error }: IrrigationResultProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/5 mb-1"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-lg border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" />Error Generating Schedule</CardTitle>
        </CardHeader>
        <CardContent><Alert variant="destructive" className="border-0"><AlertDescription>{error}</AlertDescription></Alert></CardContent>
      </Card>
    );
  }

  if (!result || !result.weeklySchedule) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Droplets className="mr-2 h-5 w-5 text-primary" />Irrigation Schedule</CardTitle>
          <CardDescription>Your 5-day watering plan will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8"><Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Enter details in the form to generate a schedule.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center"><Droplets className="mr-2 h-5 w-5 text-primary" />5-Day Irrigation Schedule</CardTitle>
        <CardDescription>A summary of the AI-generated watering plan for the upcoming week.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Timeline>
          {result.weeklySchedule.map((item, index) => (
            <TimelineItem key={index}>
              <TimelineConnector />
              <TimelineBody>
                <TimelineHeader>
                   <TimelineIcon>
                     {item.shouldWater ? <Check className="h-4 w-4"/> : <X className="h-4 w-4"/>}
                   </TimelineIcon>
                   <TimelineTitle>{item.day}</TimelineTitle>
                </TimelineHeader>
                <div className="ml-8 space-y-2">
                   {item.shouldWater && item.waterAmountMM ? (
                       <p className="text-base font-semibold text-primary">Water: {item.waterAmountMM} mm</p>
                    ) : (
                       <p className="text-base font-semibold text-muted-foreground">No Watering Recommended</p>
                    )}
                   <TimelineDescription>{item.reasoning}</TimelineDescription>
                </div>
              </TimelineBody>
            </TimelineItem>
          ))}
        </Timeline>
        
        {result.generalAdvice && (
          <Alert variant="default" className="mt-6 bg-accent/50 border-accent">
            <CloudSun className="h-5 w-5 text-primary" />
            <AlertTitle className="font-semibold text-primary">General Advice</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{result.generalAdvice}</AlertDescription>
          </Alert>
        )}

        <Alert variant="default" className="mt-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold text-primary">Disclaimer</AlertTitle>
          <AlertDescription className="text-xs">
            This schedule is an AI-generated estimate. Always check soil moisture manually before irrigating. Actual water needs can vary with unforeseen weather changes and specific field conditions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
