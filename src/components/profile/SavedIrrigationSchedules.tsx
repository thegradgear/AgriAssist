
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { db, collection, query, orderBy, getDocs, deleteDoc, doc } from '@/lib/firebase';
import type { IrrigationReport } from '@/components/irrigation-management/IrrigationResult';
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
import { Trash2, Calendar, Droplets, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportWithId extends IrrigationReport {
  id: string;
}

export function SavedIrrigationSchedules() {
  const { user } = useAuth();
  const { toast } = useToast();
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
      setError(null);
      try {
        const reportsRef = collection(db, 'users', user.uid, 'irrigationSchedules');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        } as ReportWithId));
        setReports(fetchedReports);
      } catch (err: any) {
        console.error("Failed to fetch irrigation schedules:", err);
        setError("Could not load your saved schedules. Please try again later.");
         toast({
            variant: 'destructive',
            title: 'Error Loading Schedules',
            description: err.code === 'unavailable' ? 'Could not connect to the database. Please check your internet connection.' : 'An unexpected error occurred.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user, toast]);

  const handleDelete = async (reportId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'irrigationSchedules', reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
       toast({ title: 'Schedule Deleted', description: 'The irrigation schedule has been successfully deleted.' });
    } catch (err: any) {
      console.error("Failed to delete schedule:", err);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the schedule. Please try again.'
      });
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

  if (error && reports.length === 0) {
    return (
        <Card className="text-center">
            <CardContent className="p-8">
                 <Info className="mx-auto h-12 w-12 text-destructive mb-4" />
                 <p className="text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You have no saved irrigation schedules.</p>
            <p className="text-sm text-muted-foreground mt-1">When you save a schedule from the Irrigation Management page, it will appear here.</p>
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
                <p className="font-semibold text-base">{report.inputs.cropType}</p>
                <p className="text-sm text-muted-foreground flex items-center"><Calendar className="mr-1.5 h-4 w-4"/>{report.createdAt ? format(report.createdAt, 'MMM d, yyyy') : 'N/A'}</p>
              </div>
              <div className="flex items-center font-semibold text-primary">
                 <Droplets className="mr-1.5 h-5 w-5"/>
                 {report.results.totalIrrigationMM} mm
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/50 rounded-md space-y-4">
              <h4 className="font-semibold text-lg">Schedule Details for {report.inputs.location}</h4>
              <ul className="space-y-2 text-sm">
                {report.results.weeklySchedule.map((day, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="font-medium">{day.day}:</span>
                    <span className={cn(day.shouldWater ? 'text-primary' : 'text-muted-foreground')}>
                        {day.shouldWater ? `Water ${day.waterAmountMM}mm` : "No Watering"}
                    </span>
                  </li>
                ))}
              </ul>
               <div className="border-t pt-4">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Schedule</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this irrigation schedule.
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
