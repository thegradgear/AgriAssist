'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { YieldPredictionForm } from '@/components/yield-prediction/YieldPredictionForm';
import { YieldPredictionResult } from '@/components/yield-prediction/YieldPredictionResult';
import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { useState } from 'react';

export default function YieldPredictionPage() {
  const [predictionResult, setPredictionResult] = useState<YieldPredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Yield Prediction"
        description="Estimate your crop yield based on various agricultural factors."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <YieldPredictionForm 
          onPredictionResult={setPredictionResult} 
          onPredictionLoading={setIsLoading} 
        />
        <div className="lg:sticky lg:top-24">
            <YieldPredictionResult result={predictionResult} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
