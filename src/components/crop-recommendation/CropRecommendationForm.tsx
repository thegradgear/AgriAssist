'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cropRecommendationSchema, type CropRecommendationFormData } from '@/schemas/cropRecommendationSchema';
import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { recommendCrops } from '@/ai/flows/crop-recommendation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CropRecommendationFormProps {
  onRecommendationResult: (result: CropRecommendationOutput) => void;
  onRecommendationLoading: (loading: boolean) => void;
}

export function CropRecommendationForm({ onRecommendationResult, onRecommendationLoading }: CropRecommendationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CropRecommendationFormData>({
    resolver: zodResolver(cropRecommendationSchema),
    defaultValues: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      temperature: 25, // Default average temp
      humidity: 60,    // Default average humidity
      ph: 7,           // Default neutral pH
      rainfall: 100,   // Default average rainfall
    },
  });

  async function onSubmit(data: CropRecommendationFormData) {
    setIsLoading(true);
    onRecommendationLoading(true);
    try {
      const result = await recommendCrops(data);
      onRecommendationResult(result);
      toast({
        title: 'Recommendation Successful',
        description: 'Crop recommendations have been generated.',
      });
    } catch (error: any) {
      console.error("Crop recommendation error:", error);
      toast({
        variant: 'destructive',
        title: 'Recommendation Failed',
        description: error.message || 'Could not recommend crops. Please try again.',
      });
      onRecommendationResult({ recommendedCrops: '', reasoning: ''}); // Clear previous result
    } finally {
      setIsLoading(false);
      onRecommendationLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Enter Soil & Weather Data</CardTitle>
        <CardDescription>Provide details about your soil and local climate for crop suggestions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="nitrogen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nitrogen (N)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phosphorus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phosphorus (P)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="potassium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potassium (K)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 28.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Humidity (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil pH</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 6.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rainfall"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-1">
                    <FormLabel>Rainfall (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 150" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <Button type="submit" className="w-full md:w-auto mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recommending...
                </>
              ) : (
                'Get Crop Recommendations'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
