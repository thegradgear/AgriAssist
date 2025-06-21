
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { IrrigationForm, type DailyForecastInitData } from '@/components/irrigation-management/IrrigationForm';
import { IrrigationResult } from '@/components/irrigation-management/IrrigationResult';
import type { IrrigationScheduleOutput } from '@/ai/flows/irrigation-schedule-flow';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function IrrigationPageContent() {
  const [scheduleResult, setScheduleResult] = useState<IrrigationScheduleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const forecastParam = searchParams.get('forecast');
  const locationParam = searchParams.get('location');

  let initialForecast: DailyForecastInitData[] | undefined;
  if (forecastParam) {
    try {
      initialForecast = JSON.parse(decodeURIComponent(forecastParam));
    } catch (e) {
      console.error("Failed to parse forecast from URL", e);
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Irrigation Management"
        description="Get an AI-powered 5-day watering schedule to optimize water use and ensure crop health."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <IrrigationForm
          onScheduleResult={setScheduleResult}
          onLoading={setIsLoading}
          onError={setError}
          initialForecast={initialForecast}
          initialLocation={locationParam ? decodeURIComponent(locationParam) : undefined}
        />
        <div className="lg:sticky lg:top-24">
            <IrrigationResult result={scheduleResult} loading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}

const IrrigationPageSkeleton = () => (
    <div className="container mx-auto">
      <PageHeader
        title="Irrigation Management"
        description="Get an AI-powered 5-day watering schedule to optimize water use and ensure crop health."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-3/5 mb-1" />
                <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent className="space-y-4">
                 <Skeleton className="h-24 rounded-lg" />
                 <Skeleton className="h-40 rounded-lg" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
        </Card>
        <div className="lg:sticky lg:top-24">
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-6 w-3/5 mb-1" />
                    <Skeleton className="h-4 w-4/5" />
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <Skeleton className="mx-auto h-12 w-12 rounded-full mb-3" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
);

export default function IrrigationManagementPage() {
    return (
        <Suspense fallback={<IrrigationPageSkeleton />}>
            <IrrigationPageContent />
        </Suspense>
    );
}
