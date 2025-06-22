
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, getDocs, deleteDoc, doc } from '@/lib/firebase';
import { FarmingCalendarDisplay, type FarmingCalendarReport } from '@/components/farming-calendar/FarmingCalendarDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Trees, Info } from 'lucide-react';
import { format } from 'date-fns';

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
              // Handle both Timestamp and string date formats for plantingDate
              plantingDate: data.inputs.plantingDate?.toDate ? data.inputs.plantingDate.toDate() : new Date(data.inputs.plantingDate),
            },
            results: {
              ...data.results,
              completedTasks: data.results.completedTasks || [],
            }
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
  
  const handleUpdateCompletedTasks = (reportId: string, updatedTasks: string[]) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId 
          ? { ...report, results: { ...report.results, completedTasks: updatedTasks } } 
          : report
      )
    );
  };

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
             <FarmingCalendarDisplay 
                result={report.results}
                inputs={report.inputs}
                loading={false}
                error={null}
                reportId={report.id}
                onDelete={handleDelete}
                onUpdate={handleUpdateCompletedTasks}
             />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
