
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, getDocs, deleteDoc, doc } from '@/lib/firebase';
import type { CostReport } from '@/components/cost-calculator/CostCalculatorResults';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Trash2, Calendar, IndianRupee, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportWithId extends CostReport {
  id: string;
}

const formatAmount = (amount: number, precision = 2) => {
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(amount);
};

export function SavedCostReports() {
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
        const reportsRef = collection(db, 'users', user.uid, 'costReports');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          createdAt: doc.data().createdAt?.toDate(),
        } as ReportWithId));
        setReports(fetchedReports);
      } catch (err: any) {
        console.error("Failed to fetch reports:", err);
        setError("Could not load your saved reports. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleDelete = async (reportId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'costReports', reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Failed to delete report:", err);
      setError("Could not delete the report.");
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
            <p className="text-muted-foreground">You have no saved cost calculation reports.</p>
            <p className="text-sm text-muted-foreground mt-1">When you save a report from the Cost Calculator, it will appear here.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Accordion type="single" collapsible className="w-full">
      {reports.map(report => {
        const isProfit = report.results.profitOrLoss >= 0;
        return (
          <AccordionItem value={report.id} key={report.id}>
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full pr-4">
                <div className="text-left">
                  <p className="font-semibold text-base">{report.inputs.cropName}</p>
                  <p className="text-sm text-muted-foreground flex items-center"><Calendar className="mr-1.5 h-4 w-4"/>{report.createdAt ? format(report.createdAt, 'MMM d, yyyy') : 'N/A'}</p>
                </div>
                <div className={cn("flex items-center font-semibold", isProfit ? 'text-green-600' : 'text-destructive')}>
                   {isProfit ? <TrendingUp className="mr-1.5 h-5 w-5"/> : <TrendingDown className="mr-1.5 h-5 w-5"/>}
                   <IndianRupee className="h-4 w-4"/> {formatAmount(report.results.profitOrLoss, 0)}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-muted/50 rounded-md space-y-4">
                 <h4 className="font-semibold text-lg">Report Details</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-muted-foreground text-xs">Total Cost</p><p className="font-medium flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-0.5"/>{formatAmount(report.results.totalCost)}</p></div>
                    <div><p className="text-muted-foreground text-xs">Total Revenue</p><p className="font-medium flex items-center"><IndianRupee className="h-3.5 w-3.5 mr-0.5"/>{formatAmount(report.results.totalRevenue)}</p></div>
                    <div><p className="text-muted-foreground text-xs">Profit Margin</p><p className="font-medium">{report.results.profitMargin.toFixed(2)}%</p></div>
                    <div><p className="text-muted-foreground text-xs">Area</p><p className="font-medium">{report.results.area} {report.results.areaUnit}</p></div>
                 </div>
                 <div className="border-t pt-4">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Report</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this cost report from our servers.
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
        );
      })}
    </Accordion>
  );
}
