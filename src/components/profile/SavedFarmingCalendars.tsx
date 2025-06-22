
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, getDocs, deleteDoc, doc } from '@/lib/firebase';
import type { FarmingCalendarReport } from '@/components/farming-calendar/FarmingCalendarDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Calendar, MapPin, Trees, Info, CalendarCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ReportWithId extends FarmingCalendarReport {
  id: string;
}

export function SavedFarmingCalendars() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const reportsRef = collection(db, 'users', user.uid, 'farmingCalendars');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Firestore Timestamps need to be converted
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            inputs: {
              ...data.inputs,
              plantingDate: data.inputs.plantingDate?.toDate(),
            },
          } as ReportWithId;
        });
        setReports(fetchedReports);
      } catch (err: any) {
        console.error("Failed to fetch calendars:", err);
        setError("Could not load your saved calendars. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleDelete = async (reportId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'farmingCalendars', reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Failed to delete calendar:", err);
      setError("Could not delete the calendar.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (reports.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You have no saved farming calendars.</p>
            <p className="text-sm text-muted-foreground mt-1">When you save a calendar, it will appear here for future reference.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Accordion type="single" collapsible className="w-full">
      {reports.map(report => (
        <AccordionItem value={report.id} key={report.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <div className="text-left">
                <p className="font-semibold text-base flex items-center"><Trees className="mr-2 h-4 w-4 text-primary" />{report.inputs.cropName}</p>
                <p className="text-sm text-muted-foreground flex items-center"><Calendar className="mr-1.5 h-4 w-4"/>{report.createdAt ? format(report.createdAt, 'MMM d, yyyy') : 'N/A'}</p>
              </div>
              <div className="hidden sm:block text-sm text-muted-foreground">
                <p className="flex items-center"><MapPin className="mr-1.5 h-4 w-4"/>{report.inputs.location}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/50 rounded-md space-y-4">
               <h4 className="font-semibold text-lg">Calendar Summary</h4>
               <ul className="space-y-2 text-sm">
                {report.results.schedule.slice(0, 3).map((event, index) => (
                    <li key={index} className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
                        <span><strong>{event.eventName}:</strong> {format(parseISO(event.startDate), "MMM d")}</span>
                    </li>
                ))}
                {report.results.schedule.length > 3 && (
                     <li className="flex items-center gap-2 text-muted-foreground">
                        ... and {report.results.schedule.length - 3} more activities.
                    </li>
                )}
               </ul>
               <div className="border-t pt-4">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Calendar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this farming calendar from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(report.id)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
               </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
