
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import type { FarmingCalendarOutput, CalendarEvent } from '@/ai/flows/farming-calendar-flow';
import type { FarmingCalendarFormData } from '@/schemas/farmingCalendarSchema';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription, TimelineBody } from '@/components/shared/Timeline';
import { CalendarCheck, Info, AlertTriangle, Sparkles, MessageSquare, Loader2, Save, Microscope, Droplets, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface FarmingCalendarDisplayProps {
  result: FarmingCalendarOutput | null;
  inputs: FarmingCalendarFormData | null;
  loading: boolean;
  error: string | null;
}

export interface FarmingCalendarReport {
  userId: string;
  createdAt: any; 
  inputs: FarmingCalendarFormData;
  results: FarmingCalendarOutput;
}

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
    return `${startDateStr}${endDateStr ? ' - ' + endDateStr : ''}`;
  }
};

const getCategoryBadgeVariant = (category: CalendarEvent['category']): "default" | "secondary" | "destructive" | "outline" => {
  switch (category) {
    case 'Harvesting':
    case 'Post-Harvest':
      return 'default';
    case 'Preparation':
    case 'Planting':
      return 'secondary';
    case 'Pest & Disease Management':
    case 'Weed Control':
      return 'destructive';
    case 'Fertilization':
    case 'Irrigation':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getContextualLink = (category: CalendarEvent['category']): { href: string; label: string; icon: React.ElementType } | null => {
  switch (category) {
    case 'Pest & Disease Management':
      return { href: '/crop-disease-detection', label: 'Analyze Crop Health', icon: Microscope };
    case 'Irrigation':
      return { href: '/irrigation-management', label: 'Plan Irrigation', icon: Droplets };
    default:
      return null;
  }
};


export function FarmingCalendarDisplay({ result, inputs, loading, error }: FarmingCalendarDisplayProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleTaskToggle = (eventName: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventName)) {
        newSet.delete(eventName);
      } else {
        newSet.add(eventName);
      }
      return newSet;
    });
  };
  
  const handleSaveCalendar = async () => {
    if (!result || !inputs || !user) {
      toast({
        variant: 'destructive',
        title: 'Cannot Save Calendar',
        description: 'You must be logged in and have a valid calendar result to save.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const reportData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        inputs,
        results: result,
      };
      const reportsCollectionRef = collection(db, 'users', user.uid, 'farmingCalendars');
      await addDoc(reportsCollectionRef, reportData);
      toast({
        title: 'Calendar Saved',
        description: 'Your farming calendar has been saved to your profile.',
      });
    } catch (error) {
      console.error('Error saving calendar:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the calendar. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return (
        <Card className="shadow-lg animate-pulse">
            <CardHeader><div className="h-6 bg-muted rounded w-3/5 mb-1"></div><div className="h-4 bg-muted rounded w-4/5"></div></CardHeader>
            <CardContent className="space-y-4"><div className="h-40 bg-muted rounded"></div><div className="h-24 bg-muted rounded"></div></CardContent>
        </Card>
    );
  }
  
  if (error) {
    return (
        <Card className="shadow-lg border-destructive bg-destructive/10">
            <CardHeader><CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" />Error Generating Calendar</CardTitle></CardHeader>
            <CardContent><Alert variant="destructive" className="border-0"><AlertDescription>{error}</AlertDescription></Alert></CardContent>
        </Card>
    );
  }

  if (!result || !result.schedule || result.schedule.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader><CardTitle className="flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-primary" />Farming Schedule</CardTitle><CardDescription>Your personalized farming calendar will appear here.</CardDescription></CardHeader>
        <CardContent><div className="text-center py-8"><Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Enter details in the form to generate your farming schedule.</p></div></CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
                <CardTitle className="flex items-center"><CalendarCheck className="mr-2 h-5 w-5 text-primary" />Farming Calendar for {result.cropName}</CardTitle>
                <CardDescription>Location: {result.location} | Approx. Planting: {formatDateRange(result.plantingDate)}</CardDescription>
            </div>
             {user && (
              <Button onClick={handleSaveCalendar} disabled={isSaving} size="sm">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Calendar</>}
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Timeline>
          {result.schedule.map((event, index) => {
            const isCompleted = completedTasks.has(event.eventName);
            const contextualLink = getContextualLink(event.category);

            return (
              <TimelineItem key={index} className={cn(isCompleted && "opacity-60")}>
                <TimelineConnector />
                <TimelineBody>
                  <TimelineHeader>
                    <TimelineIcon><CalendarCheck className="h-4 w-4" /></TimelineIcon>
                     <div className="flex items-center gap-4 ml-8 w-full">
                        <Checkbox id={`task-${index}`} checked={isCompleted} onCheckedChange={() => handleTaskToggle(event.eventName)} className="h-5 w-5"/>
                        <div className="flex-1">
                          <TimelineTitle className={cn("ml-0", isCompleted && "line-through text-muted-foreground")}>{event.eventName}</TimelineTitle>
                          <TimelineDescription className="ml-0">{formatDateRange(event.startDate, event.endDate)}</TimelineDescription>
                        </div>
                        <Badge variant={getCategoryBadgeVariant(event.category)} className="ml-auto self-start">{event.category}</Badge>
                      </div>
                  </TimelineHeader>
                  <div className="ml-16 pl-1 pt-2 space-y-3">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    {contextualLink && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={contextualLink.href}>
                          <contextualLink.icon className="mr-2 h-4 w-4" />
                          {contextualLink.label}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </TimelineBody>
              </TimelineItem>
            );
          })}
        </Timeline>

        {result.generalAdvice && (
          <Alert variant="default" className="mt-6 bg-accent/50 border-accent"><MessageSquare className="h-5 w-5 text-primary" /><AlertTitle className="font-semibold text-primary">General Advice</AlertTitle><AlertDescription className="whitespace-pre-line">{result.generalAdvice}</AlertDescription></Alert>
        )}

        <Alert variant="default" className="mt-4"><Sparkles className="h-4 w-4 text-primary" /><AlertTitle className="font-semibold text-primary">Disclaimer</AlertTitle><AlertDescription className="text-xs">This AI-generated calendar provides general guidance. Actual timings may vary based on local conditions. Always adapt to your specific farm environment.</AlertDescription></Alert>
      </CardContent>
    </Card>
  );
}
