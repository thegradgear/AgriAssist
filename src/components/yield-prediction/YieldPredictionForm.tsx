
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { yieldPredictionSchema, type YieldPredictionFormData, soilTypes, irrigationOptions } from '@/schemas/yieldPredictionSchema';
import type { YieldPredictionOutput } from '@/ai/flows/yield-prediction';
import { predictYield } from '@/ai/flows/yield-prediction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { indianStatesAndDistricts } from '@/lib/indian-states-districts';

interface YieldPredictionFormProps {
  onPredictionResult: (result: YieldPredictionOutput | null) => void;
  onPredictionLoading: (loading: boolean) => void;
}

const indianStates = Object.keys(indianStatesAndDistricts);
const seasons = ["Kharif", "Rabi", "Zaid", "Whole Year"];


export function YieldPredictionForm({ onPredictionResult, onPredictionLoading }: YieldPredictionFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<YieldPredictionFormData>({
    resolver: zodResolver(yieldPredictionSchema),
    defaultValues: {
      state: '',
      district: '',
      season: '',
      crop: '',
      area: 1, // Defaulting to 1 to avoid placeholder issues with number fields
      soilType: undefined,
      irrigationAvailability: undefined,
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
       onPredictionResult(null);
    } finally {
      setIsLoading(false);
      onPredictionLoading(false);
    }
  }

  if (!isClient) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <Skeleton className="h-7 w-3/5" />
          <Skeleton className="h-5 w-4/5 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">Enter Crop Details</CardTitle>
        <CardDescription>Provide the necessary information to predict your crop yield.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={districts.length === 0}>
                       <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                           <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select Season" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="e.g., Rice" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (in acres)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 5.5" {...field} suppressHydrationWarning />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="soilType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select Soil Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {soilTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="irrigationAvailability"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Irrigation Availability (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger suppressHydrationWarning>
                          <SelectValue placeholder="Select Irrigation Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {irrigationOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading} suppressHydrationWarning>
            {isLoading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
                </>
            ) : (
                'Predict Yield'
            )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
