
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cropPricePredictionSchema, type CropPricePredictionFormData } from '@/schemas/cropPricePredictionSchema';
import type { PredictCropPriceOutput } from '@/ai/flows/predict-crop-price-flow';
import { predictCropPrice } from '@/ai/flows/predict-crop-price-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, IndianRupee } from 'lucide-react';

interface CropPricePredictionFormProps {
  onPredictionResult: (result: PredictCropPriceOutput | null) => void;
  onPredictionLoading: (loading: boolean) => void;
}

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
] as const;

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

export function CropPricePredictionForm({ onPredictionResult, onPredictionLoading }: CropPricePredictionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const form = useForm<CropPricePredictionFormData>({
    resolver: zodResolver(cropPricePredictionSchema),
    defaultValues: {
      cropName: '',
      marketLocation: '',
      monthOfSale: months[0], // Static default for SSR
      yearOfSale: currentYear, // Static default for SSR
      gradeOrQuality: '',
      historicalPriceData: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
    // Set client-side defaults after mount
    // This check ensures we only set it if the user hasn't already interacted
    if (!form.formState.isDirty) {
      form.setValue('monthOfSale', months[new Date().getMonth()]);
      form.setValue('yearOfSale', new Date().getFullYear());
    }
  }, [form]);


  async function onSubmit(data: CropPricePredictionFormData) {
    setIsLoading(true);
    onPredictionLoading(true);
    onPredictionResult(null); 
    try {
      const result = await predictCropPrice({
        ...data,
        yearOfSale: Number(data.yearOfSale) 
      });
      onPredictionResult(result);
      toast({
        title: 'Price Prediction Generated',
        description: 'The estimated crop price has been calculated.',
      });
    } catch (error: any) {
      console.error("Crop price prediction error:", error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error.message || 'Could not predict crop price. Please try again.',
      });
      onPredictionResult(null);
    } finally {
      setIsLoading(false);
      onPredictionLoading(false);
    }
  }

  if (!isClient) {
    // Render a simplified version or null for SSR to match client until hydration
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                <IndianRupee className="mr-2 h-6 w-6 text-primary" />
                Prediction Inputs
                </CardTitle>
                <CardDescription>Enter details about your crop and market conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-muted rounded w-full"></div>
                    <div className="h-10 bg-muted rounded w-full"></div>
                </div>
                <div className="h-10 bg-muted rounded w-full"></div>
                <div className="h-20 bg-muted rounded w-full"></div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled={true}>Predict Crop Price</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <IndianRupee className="mr-2 h-6 w-6 text-primary" />
          Prediction Inputs
        </CardTitle>
        <CardDescription>Enter details about your crop and market conditions.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="cropName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Wheat, Tomato" {...field} suppressHydrationWarning />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marketLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Delhi Azadpur Mandi, Local Village Market" {...field} suppressHydrationWarning />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthOfSale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month of Sale</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} >
                      <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearOfSale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Sale</FormLabel>
                     <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)} >
                      <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="gradeOrQuality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade/Quality (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grade A, Export Quality" {...field} suppressHydrationWarning />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="historicalPriceData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Price Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Last year same time was 2000 INR/quintal" {...field} className="min-h-[60px]" suppressHydrationWarning />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting Price...
                </>
              ) : (
                'Predict Crop Price'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
