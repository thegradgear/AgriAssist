
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { FarmingCalendarForm } from '@/components/farming-calendar/FarmingCalendarForm';
import { FarmingCalendarDisplay } from '@/components/farming-calendar/FarmingCalendarDisplay';
import type { FarmingCalendarOutput } from '@/ai/flows/farming-calendar-flow';
import type { FarmingCalendarFormData } from '@/schemas/farmingCalendarSchema';
import { useState } from 'react';

export default function FarmingCalendarPage() {
  const [calendarResult, setCalendarResult] = useState<FarmingCalendarOutput | null>(null);
  const [formInputs, setFormInputs] = useState<FarmingCalendarFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Personalized Farming Calendar"
        description="Get a customized schedule for planting, fertilizing, and harvesting your crops."
      />
      <div className="grid grid-cols-1 gap-8">
        <div>
          <FarmingCalendarForm
            onCalendarResult={(result) => {
              setCalendarResult(result);
              // Clear previous inputs if result is null (e.g. on error)
              if (!result) setFormInputs(null);
            }}
            onFormSubmit={setFormInputs}
            onLoading={setIsLoading}
            onError={setError}
          />
        </div>
        <div>
          <FarmingCalendarDisplay 
            result={calendarResult} 
            inputs={formInputs}
            loading={isLoading} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
}
