
'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { IrrigationScheduleOutput } from '@/ai/flows/irrigation-schedule-flow';
import type { IrrigationFormData } from '@/schemas/irrigationSchema';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription, TimelineBody } from '@/components/shared/Timeline';
import { Droplets, Info, AlertTriangle, CloudSun, X, Check, Save, Loader2, BarChart2 } from 'lucide-react';
import { Button } from '../ui/button';

interface IrrigationResultProps {
  result: IrrigationScheduleOutput | null;
  inputs: IrrigationFormData | null;
  loading: boolean;
  error: string | null;
}

export interface IrrigationReport {
  userId: string;
  createdAt: any; 
  inputs: IrrigationFormData;
  results: IrrigationScheduleOutput;
}

const chartConfig: ChartConfig = {
  rainfall: {
    label: 'Rainfall (mm)',
    color: 'hsl(var(--secondary))',
  },
  irrigation: {
    label: 'Irrigation (mm)',
    color: 'hsl(var(--primary))',
  },
};

export function IrrigationResult({ result, inputs, loading, error }: IrrigationResultProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSchedule = async () => {
    if (!result || !inputs || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Schedule',
        description: 'You must be logged in and have a valid schedule result to save.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const reportData: Omit<IrrigationReport, 'id'> = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        inputs,
        results: result,
      };
      const schedulesCollectionRef = collection(db, 'users', user.uid, 'irrigationSchedules');
      await addDoc(schedulesCollectionRef, reportData);

      toast({
        title: 'Schedule Saved',
        description: 'Your irrigation plan has been saved to your profile.',
      });
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      let description = 'Could not save the schedule. Please try again.';
      if (error.code === 'unavailable') {
        description = 'Cannot connect to the database. Please check your internet connection and try again.';
      }
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description,
      });
    } finally {
      setIsSaving(false);
    }
  };

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
  
  const chartData = [
    { name: "5-Day Total", rainfall: result.totalRainfallMM, irrigation: result.totalIrrigationMM },
  ];

  return (
    <div className="space-y-6">
        <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div className="flex-1">
                    <CardTitle className="flex items-center"><Droplets className="mr-2 h-5 w-5 text-primary" />5-Day Irrigation Schedule</CardTitle>
                    <CardDescription>A summary of the AI-generated watering plan.</CardDescription>
                </div>
                {user && (
                <Button onClick={handleSaveSchedule} disabled={isSaving}>
                    {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                    <><Save className="mr-2 h-4 w-4" />Save</>
                    )}
                </Button>
                )}
            </div>
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
        </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary"/>5-Day Water Balance</CardTitle>
                <CardDescription>Comparison of forecasted rainfall and recommended irrigation.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `${value}mm`} tickLine={false} axisLine={false} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Legend />
                        <Bar dataKey="rainfall" fill="var(--color-rainfall)" radius={4} />
                        <Bar dataKey="irrigation" fill="var(--color-irrigation)" radius={4} />
                    </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        <Alert variant="default" className="mt-4 bg-warning/10 border-warning/30">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="font-semibold text-foreground">Disclaimer</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            This schedule is an AI-generated estimate. Always check soil moisture manually before irrigating. Actual water needs can vary with unforeseen weather changes and specific field conditions.
          </AlertDescription>
        </Alert>
    </div>
  );
}
