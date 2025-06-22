
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, orderBy, getDocs, deleteDoc, doc } from '@/lib/firebase';
import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import type { IdentifyPestWeedOutput } from '@/ai/flows/identify-pest-weed-flow';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Calendar, Microscope, Bug, Leaf, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type AnalysisResult = DiagnoseCropDiseaseOutput | IdentifyPestWeedOutput;

interface HealthAnalysisReport {
  id: string;
  userId: string;
  createdAt: any;
  analysisType: 'disease' | 'pest';
  photoDataUri: string;
  result: AnalysisResult;
  inputs: { cropType?: string; contextNotes?: string };
}

export function SavedHealthAnalyses() {
  const { user } = useAuth();
  const [reports, setReports] = useState<HealthAnalysisReport[]>([]);
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
        const reportsRef = collection(db, 'users', user.uid, 'healthAnalyses');
        const q = query(reportsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        } as HealthAnalysisReport));
        setReports(fetchedReports);
      } catch (err: any) {
        console.error("Failed to fetch health analyses:", err);
        setError("Could not load your saved analyses.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [user]);

  const handleDelete = async (reportId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'healthAnalyses', reportId));
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error("Failed to delete analysis:", err);
      setError("Could not delete the analysis.");
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>;
  }
  if (error) {
    return <p className="text-destructive">{error}</p>;
  }
  if (reports.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You have no saved health analysis reports.</p>
            <p className="text-sm text-muted-foreground mt-1">When you save an analysis, it will appear here.</p>
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
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={report.photoDataUri} alt="Analysis thumbnail" layout="fill" objectFit="cover" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base">
                    {report.analysisType === 'disease' 
                      ? (report.result as DiagnoseCropDiseaseOutput).diseaseName 
                      : (report.result as IdentifyPestWeedOutput).commonName}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center"><Calendar className="mr-1.5 h-4 w-4"/>{report.createdAt ? format(report.createdAt, 'MMM d, yyyy') : 'N/A'}</p>
                </div>
              </div>
              <Badge variant={report.analysisType === 'disease' ? 'destructive' : 'secondary'} className="hidden sm:flex items-center">
                {report.analysisType === 'disease' ? <Microscope className="mr-1.5 h-4 w-4"/> : <Bug className="mr-1.5 h-4 w-4"/>}
                {report.analysisType === 'disease' ? 'Disease' : 'Pest/Weed'}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 bg-muted/50 rounded-md space-y-4">
              {report.analysisType === 'disease' ? (
                <DiseaseResultContent result={report.result as DiagnoseCropDiseaseOutput} />
              ) : (
                <PestWeedResultContent result={report.result as IdentifyPestWeedOutput} />
              )}
              <div className="border-t pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/>Delete Report</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this analysis.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(report.id)}>Continue</AlertDialogAction></AlertDialogFooter>
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

const DiseaseResultContent = ({ result }: { result: DiagnoseCropDiseaseOutput }) => {
  const severityValue = result.severity === 'Low' ? 33 : result.severity === 'Medium' ? 66 : result.severity === 'High' ? 100 : 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? <AlertTriangle className="h-6 w-6 text-destructive" /> : <CheckCircle className="h-6 w-6 text-green-600" />}
        <h4 className="font-semibold text-lg">{result.diseaseName}</h4>
      </div>
      {result.isDiseased && result.diseaseName !== "Unable to Diagnose" && (
        <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Confidence</p><Progress value={result.confidence * 100} className="h-2" /></div>
            <div><p className="text-xs text-muted-foreground">Severity</p><Progress value={severityValue} className="h-2" /></div>
        </div>
      )}
      <div><p className="text-sm font-semibold">Explanation</p><p className="text-xs text-muted-foreground">{result.detectionExplanation}</p></div>
      <div><p className="text-sm font-semibold">Remedies</p><ul className="list-disc list-inside text-xs text-muted-foreground">{result.remedies.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
    </div>
  );
};

const PestWeedResultContent = ({ result }: { result: IdentifyPestWeedOutput }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      {result.identificationType === 'PEST' ? <Bug className="h-6 w-6"/> : <Leaf className="h-6 w-6"/>}
      <div>
        <h4 className="font-semibold text-lg">{result.commonName}</h4>
        <p className="text-xs italic text-muted-foreground">{result.scientificName}</p>
      </div>
    </div>
    <Badge variant={result.isHarmful ? 'destructive' : 'secondary'}>{result.isHarmful ? 'Harmful' : 'Not Harmful / Beneficial'}</Badge>
    <div><p className="text-sm font-semibold">Explanation</p><p className="text-xs text-muted-foreground">{result.detectionExplanation}</p></div>
    <div><p className="text-sm font-semibold">Management</p><ul className="list-disc list-inside text-xs text-muted-foreground">{result.managementSolutions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
  </div>
);
