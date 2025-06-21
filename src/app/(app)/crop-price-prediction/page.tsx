
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { CropPricePredictionForm } from '@/components/crop-price-prediction/CropPricePredictionForm';
import { CropPricePredictionResult } from '@/components/crop-price-prediction/CropPricePredictionResult';
import type { PredictCropPriceOutput } from '@/ai/flows/predict-crop-price-flow';
import { useState } from 'react';

export default function CropPricePredictionPage() {
  const [predictionResult, setPredictionResult] = useState<PredictCropPriceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Price Prediction"
        description="Estimate the future market price of your crop based on various factors."
      />
      <div className="grid grid-cols-1 gap-8">
        <CropPricePredictionForm 
          onPredictionResult={setPredictionResult} 
          onPredictionLoading={setIsLoading}
        />
        <CropPricePredictionResult result={predictionResult} loading={isLoading} />
      </div>
    </div>
  );
}
