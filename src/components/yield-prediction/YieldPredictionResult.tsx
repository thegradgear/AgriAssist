
'use client';

import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart3, TrendingUp, AlertTriangle, ChevronsLeftRight } from 'lucide-react';

interface YieldPredictionResultProps {
  result: YieldPredictionOutput | null;
  loading: boolean;
}

export function YieldPredictionResult({ result, loading }: YieldPredictionResultProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/5 mb-1" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-16 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!result || !result.predictedYield) {
    return null; 
  }
  
  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-primary" />
          Prediction Result
        </CardTitle>
        <CardDescription>
          Based on the provided information, here is the estimated crop yield.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground leading-normal">Most Likely Yield</p>
          <p className="text-3xl font-bold text-primary leading-tight">
            {result.predictedYield.toLocaleString()} {result.unit}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground leading-normal flex items-center"><ChevronsLeftRight className="mr-1.5 h-4 w-4"/>Expected Range</p>
          <p className="text-lg font-medium text-foreground leading-snug">
              {result.predictedYieldRangeMin.toLocaleString()} – {result.predictedYieldRangeMax.toLocaleString()} {result.unit}
          </p>
        </div>
        
        {result.riskFactors && (
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700 font-semibold">Key Risk Factors</AlertTitle>
                <AlertDescription className="text-amber-700/80">
                    {result.riskFactors}
                </AlertDescription>
            </Alert>
        )}

        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-2 flex items-center leading-snug">
            <TrendingUp className="mr-2 h-5 w-5 text-muted-foreground" />
            Next Steps
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 leading-normal">
            <li>This prediction is an estimate. Actual yields can vary based on weather, pest pressure, and farm management practices.</li>
            <li>Use this information for planning purposes, such as estimating storage needs and potential revenue.</li>
            <li>Consult local agricultural extension services for more region-specific advice.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
