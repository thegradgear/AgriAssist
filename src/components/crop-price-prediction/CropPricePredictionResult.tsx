
'use client';

import type { PredictCropPriceOutput } from '@/ai/flows/predict-crop-price-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, Percent, Info, AlertTriangle, Sparkles, Receipt } from 'lucide-react';

interface CropPricePredictionResultProps {
  result: PredictCropPriceOutput | null;
  loading: boolean;
}

export function CropPricePredictionResult({ result, loading }: CropPricePredictionResultProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-7 bg-muted rounded w-3/5 mb-2"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-1/2"></div>
          </div>
           {Math.random() > 0.5 && ( // Randomly show skeleton for price range
            <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-1/4"></div>
                <div className="h-6 bg-muted rounded w-2/5"></div>
            </div>
          )}
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-1/4"></div>
            <div className="flex items-center gap-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-5 bg-muted rounded w-1/6"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-muted rounded w-2/5"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                 <CardTitle className="font-headline flex items-center">
                    <Receipt className="mr-2 h-6 w-6 text-primary" />
                    Price Prediction
                </CardTitle>
                <CardDescription>Enter the details in the form to get a price prediction.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 mb-3" />
                    <p>Your crop price prediction will appear here once calculated.</p>
                </div>
            </CardContent>
        </Card>
    );
  }
  
  const confidencePercentage = result.confidenceLevel * 100;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          AI Price Prediction
        </CardTitle>
        <CardDescription>
          Estimated market price based on the information you provided.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Predicted Price</p>
          <p className="text-3xl font-bold text-primary">
            {result.predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {result.priceUnit}
          </p>
        </div>

        {(result.priceRangeMin !== undefined && result.priceRangeMax !== undefined) && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Estimated Price Range</p>
            <p className="text-lg font-medium text-foreground">
              {result.priceRangeMin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - {result.priceRangeMax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {result.priceUnit}
            </p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Confidence Level</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={confidencePercentage} className="w-full h-2.5" aria-label={`Confidence: ${confidencePercentage.toFixed(0)}%`} />
            <span className="text-sm font-semibold text-primary">{confidencePercentage.toFixed(0)}%</span>
          </div>
          {result.confidenceLevel < 0.6 && (
            <p className="text-xs text-amber-600 mt-1 flex items-center">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              Confidence is relatively low. Consider this a broad estimate.
            </p>
          )}
        </div>
        
        {result.factorsConsidered && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground flex items-center">
                <Info className="mr-1.5 h-4 w-4" />
                Factors Considered
            </p>
            <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">{result.factorsConsidered}</p>
          </div>
        )}

        {result.marketOutlook && (
             <div>
                <p className="text-sm font-semibold text-muted-foreground flex items-center">
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Market Outlook
                </p>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">{result.marketOutlook}</p>
            </div>
        )}

        <Alert variant="default" className="bg-accent/50 border-accent">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-semibold text-primary">Disclaimer</AlertTitle>
          <AlertDescription className="text-xs">
            Crop prices are volatile and subject to numerous unpredictable factors. This AI prediction is for informational purposes only and should not be considered financial advice or a guarantee of future prices. Always consult with market experts and local advisors.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
