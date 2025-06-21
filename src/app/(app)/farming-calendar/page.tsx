
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { FarmingCalendarForm } from '@/components/farming-calendar/FarmingCalendarForm';
import { FarmingCalendarDisplay } from '@/components/farming-calendar/FarmingCalendarDisplay';
import type { FarmingCalendarOutput } from '@/ai/flows/farming-calendar-flow';
import { useState } from 'react';

export default function FarmingCalendarPage() {
  const [calendarResult, setCalendarResult] = useState<FarmingCalendarOutput | null>(null);
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
            onCalendarResult={setCalendarResult}
            onLoading={setIsLoading}
            onError={setError}
          />
        </div>
        <div>
          <FarmingCalendarDisplay result={calendarResult} loading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
