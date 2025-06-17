'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CropRecommendationForm } from '@/components/crop-recommendation/CropRecommendationForm';
import { CropRecommendationResult } from '@/components/crop-recommendation/CropRecommendationResult';
import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { useState } from 'react';

export default function CropRecommendationPage() {
  const [recommendationResult, setRecommendationResult] = useState<CropRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Recommendation"
        description="Get suggestions for the best crops to plant based on your soil and weather conditions."
      />
      <div className="grid grid-cols-1 gap-8">
        <CropRecommendationForm 
          onRecommendationResult={setRecommendationResult} 
          onRecommendationLoading={setIsLoading}
        />
        <CropRecommendationResult result={recommendationResult} loading={isLoading} />
      </div>
    </div>
  );
}
