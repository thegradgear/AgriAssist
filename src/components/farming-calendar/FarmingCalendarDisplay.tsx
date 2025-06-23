
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db, addDoc, collection, serverTimestamp, doc, updateDoc } from '@/lib/firebase';
import type { FarmingCalendarOutput, CalendarEvent } from '@/ai/flows/farming-calendar-flow';
import type { FarmingCalendarFormData } from '@/schemas/farmingCalendarSchema';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineDescription, TimelineBody } from '@/components/shared/Timeline';
import { CalendarCheck, Info, AlertTriangle, MessageSquare, Loader2, Save, Microscope, Droplets, ArrowRight, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface FarmingCalendarDisplayProps {
  result: FarmingCalendarOutput | null;
  inputs: FarmingCalendarFormData | null;
  loading: boolean;
  error: string | null;
  reportId?: string; // Optional: ID if it's a saved report
  onDelete?: (id: string) => void; // Optional: Callback to handle deletion
  onUpdate?: (reportId: string, updatedTasks: string[]) => void; // Callback to update parent state
}

export interface FarmingCalendarReport {
  userId: string;
  createdAt: any; 
  inputs: FarmingCalendarFormData;
  results: FarmingCalendarOutput & { completedTasks?: string[] }; // Add completedTasks here
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
      return { href: '/crop-health', label: 'Analyze Crop Health', icon: Microscope };
    case 'Irrigation':
      return { href: '/irrigation-management', label: 'Plan Irrigation', icon: Droplets };
    default:
      return null;
  }
};

export function FarmingCalendarDisplay({ result, inputs, loading, error, reportId, onDelete, onUpdate }: FarmingCalendarDisplayProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set(result?.completedTasks || []));

  useEffect(() => {
    setCompletedTasks(new Set(result?.completedTasks || []));
  }, [result]);
  
  const handleTaskToggle = async (eventName: string) => {
    const newSet = new Set(completedTasks);
    if (newSet.has(eventName)) {
      newSet.delete(eventName);
    } else {
      newSet.add(eventName);
    }
    setCompletedTasks(newSet);

    if (reportId && user) {
      try {
        const reportRef = doc(db, 'users', user.uid, 'farmingCalendars', reportId);
        await updateDoc(reportRef, {
          'results.completedTasks': Array.from(newSet),
        });
        toast({
            title: 'Progress Saved',
            description: `Task "${eventName}" status updated.`,
            duration: 2000,
        });
        // Notify parent component of the update
        if (onUpdate) {
          onUpdate(reportId, Array.from(newSet));
        }
      } catch (err: any) {
        console.error("Failed to update task status:", err);
        let description = 'Could not save task progress. Please try again.';
        if (err.code === 'unavailable') {
          description = 'Cannot connect to the database. Please check your internet connection and try again.';
        }
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description,
        });
        // Revert local state on failure
        const revertedSet = new Set(completedTasks);
        if (revertedSet.has(eventName)) {
            revertedSet.delete(eventName);
        } else {
            revertedSet.add(eventName);
        }
        setCompletedTasks(revertedSet);
      }
    }
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
      const reportData: Omit<FarmingCalendarReport, 'id'> = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        inputs: {
          ...inputs,
          soilType: inputs.soilType ?? null,
          farmingPractice: inputs.farmingPractice ?? null,
        },
        results: {
            ...result,
            completedTasks: [], // Initialize with empty completed tasks
        },
      };
      const reportsCollectionRef = collection(db, 'users', user.uid, 'farmingCalendars');
      await addDoc(reportsCollectionRef, reportData);
      toast({
        title: 'Calendar Saved',
        description: 'Your farming calendar has been saved to your profile.',
      });
    } catch (error: any) {
      console.error('Error saving calendar:', error);
      let description = 'Could not save the calendar. Please try again.';
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
    if (reportId) return null;

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
             {user && !reportId && (
              <Button onClick={handleSaveCalendar} disabled={isSaving} size="sm">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Calendar</>}
              </Button>
            )}
            {reportId && onDelete && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="ml-auto"><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this farming calendar.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(reportId)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
                     <div className="flex items-start gap-3 ml-8 w-full">
                        <Checkbox 
                            id={`task-${reportId || 'new'}-${index}`} 
                            checked={isCompleted} 
                            onCheckedChange={() => handleTaskToggle(event.eventName)} 
                            className="h-5 w-5 mt-1.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                           <div className="flex flex-col items-start gap-y-1 sm:flex-row sm:items-center sm:gap-x-4">
                                <TimelineTitle className={cn("ml-0", isCompleted && "line-through text-muted-foreground")}>
                                    {event.eventName}
                                </TimelineTitle>
                                <Badge variant={getCategoryBadgeVariant(event.category)} className="mr-5 flex-shrink-0 sm:ml-auto">
                                    {event.category}
                                </Badge>
                            </div>
                            <TimelineDescription className="ml-0">
                                {formatDateRange(event.startDate, event.endDate)}
                            </TimelineDescription>
                        </div>
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

        <Alert variant="default" className="mt-4 bg-warning/10 border-warning/30">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="font-semibold text-foreground">Disclaimer</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">This AI-generated calendar provides general guidance. Actual timings may vary based on local conditions. Always adapt to your specific farm environment.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
