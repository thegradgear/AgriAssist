
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { yieldPredictionSchema, type YieldPredictionFormData } from '@/schemas/yieldPredictionSchema';
import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { predictYield } from '@/ai/flows/yield-prediction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { indianStatesAndDistricts } from '@/lib/indian-states-districts';

interface YieldPredictionFormProps {
  onPredictionResult: (result: YieldPredictionOutput) => void;
  onPredictionLoading: (loading: boolean) => void;
}

const indianStates = Object.keys(indianStatesAndDistricts);
const seasons = ["Kharif", "Rabi", "Zaid", "Whole Year"];


export function YieldPredictionForm({ onPredictionResult, onPredictionLoading }: YieldPredictionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);

  const form = useForm<YieldPredictionFormData>({
    resolver: zodResolver(yieldPredictionSchema),
    defaultValues: {
      state: '',
      district: '',
      season: '',
      crop: '',
      area: 0,
    },
  });

  const selectedState = form.watch('state');

  useEffect(() => {
    if (selectedState && indianStatesAndDistricts[selectedState]) {
      setDistricts(indianStatesAndDistricts[selectedState]);
      if (form.getValues('district')) {
        form.setValue('district', ''); 
      }
    } else {
      setDistricts([]);
      if (form.getValues('district')) {
        form.setValue('district', '');
      }
    }
  }, [selectedState, form]);

  async function onSubmit(data: YieldPredictionFormData) {
    setIsLoading(true);
    onPredictionLoading(true);
    try {
      const result = await predictYield(data);
      onPredictionResult(result);
      toast({
        title: 'Prediction Successful',
        description: 'Yield prediction has been generated.',
      });
    } catch (error: any) {
      console.error("Yield prediction error:", error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error.message || 'Could not predict yield. Please try again.',
      });
       onPredictionResult({predictedYield: 0, unit: '', confidence: 0}); // Clear previous results on error
    } finally {
      setIsLoading(false);
      onPredictionLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Enter Crop Details</CardTitle>
        <CardDescription>Provide the necessary information to predict your crop yield.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                       <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" disabled={districts.length === 0}>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Season</FormLabel>
                     <FormControl>
                       <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="">Select Season</option>
                        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Rice" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Area (in acres)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 5.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Predicting...
                </>
              ) : (
                'Predict Yield'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
