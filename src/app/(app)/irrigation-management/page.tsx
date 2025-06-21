
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { IrrigationForm } from '@/components/irrigation-management/IrrigationForm';
import { IrrigationResult } from '@/components/irrigation-management/IrrigationResult';
import type { IrrigationScheduleOutput } from '@/ai/flows/irrigation-schedule-flow';
import { useState } from 'react';

export default function IrrigationManagementPage() {
  const [scheduleResult, setScheduleResult] = useState<IrrigationScheduleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Irrigation Management"
        description="Get an AI-powered 7-day watering schedule to optimize water use and ensure crop health."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <IrrigationForm
          onScheduleResult={setScheduleResult}
          onLoading={setIsLoading}
          onError={setError}
        />
        <div className="lg:sticky lg:top-24">
            <IrrigationResult result={scheduleResult} loading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
