
'use client';

import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, CheckCircle, Info } from 'lucide-react';

interface CropRecommendationResultProps {
  result: CropRecommendationOutput | null;
  loading: boolean;
}

export function CropRecommendationResult({ result, loading }: CropRecommendationResultProps) {
  if (loading) {
    return (
      <Card className="shadow-lg animate-pulse mt-8">
        <CardHeader>
          <CardTitle>Crop Recommendations</CardTitle>
          <CardDescription>Analyzing data to suggest the best crops...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-full mt-2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-10 bg-muted rounded w-1/2 mt-4"></div>
        </CardContent>
      </Card>
    );
  }

  if (!result || !result.recommendedCrops) {
    return null; 
  }

  const crops = result.recommendedCrops.split(',').map(crop => crop.trim()).filter(crop => crop);

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Leaf className="mr-2 h-5 w-5 text-primary" /> {/* Icon size adjusted */}
          Crop Recommendations
        </CardTitle>
        <CardDescription>
          Based on your input, these crops are recommended for planting.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          {/* Using h3 class for this heading type based on new hierarchy */ }
          <h3 className="text-xl font-medium leading-snug mb-2 flex items-center"> 
            <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
            Recommended Crops
          </h3>
          {crops.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {crops.map((crop, index) => (
                <Badge key={index} variant="secondary" className="text-base px-3 py-1 bg-primary/20 text-primary-foreground hover:bg-primary/30">
                  {crop}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm leading-normal">No specific crops could be recommended based on the input. Try adjusting the values.</p>
          )}
        </div>
        
        {result.reasoning && (
          <div className="border-t pt-4">
            <h3 className="text-xl font-medium leading-snug mb-2 flex items-center">
              <Info className="mr-2 h-5 w-5 text-muted-foreground" />
              Reasoning
            </h3>
            <p className="text-sm text-muted-foreground leading-normal whitespace-pre-line">
              {result.reasoning}
            </p>
          </div>
        )}

        <div className="border-t pt-4">
            <h3 className="text-lg font-medium leading-snug mb-2">Important Considerations:</h3> {/* H4 equivalent for this list header */}
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 leading-normal">
                <li>Local market demand and prices for these crops.</li>
                <li>Availability of quality seeds and other inputs.</li>
                <li>Your experience and resources for cultivating these crops.</li>
                <li>Always perform a small-scale trial before large-scale planting.</li>
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
