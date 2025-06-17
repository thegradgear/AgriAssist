'use client';

import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

interface YieldPredictionResultProps {
  result: YieldPredictionOutput | null;
  loading: boolean;
}

export function YieldPredictionResult({ result, loading }: YieldPredictionResultProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <CardTitle className="font-headline">Prediction Result</CardTitle>
          <CardDescription>Calculating your potential yield...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (!result || result.predictedYield === 0 && result.confidence === 0) { // Check for initial or error state
    return null; 
  }
  
  const confidencePercentage = result.confidence * 100;

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <BarChart3 className="mr-2 h-6 w-6 text-primary" />
          Prediction Result
        </CardTitle>
        <CardDescription>
          Based on the provided information, here is the predicted crop yield.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Predicted Yield</p>
          <p className="text-3xl font-bold text-primary">
            {result.predictedYield.toLocaleString()} {result.unit}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Confidence Level</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={confidencePercentage} className="w-full h-3" aria-label={`Confidence: ${confidencePercentage.toFixed(0)}%`} />
            <span className="text-sm font-semibold text-primary">{confidencePercentage.toFixed(0)}%</span>
          </div>
          {result.confidence < 0.6 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Confidence is low. Consider this an estimate.
            </p>
          )}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-2 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            Next Steps
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Verify input data for accuracy.</li>
            <li>Compare with historical data for your region if available.</li>
            <li>Consult local agricultural experts for further guidance.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
