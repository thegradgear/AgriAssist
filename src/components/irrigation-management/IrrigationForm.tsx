
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { irrigationSchema, type IrrigationFormData, soilTypes, growthStages } from '@/schemas/irrigationSchema';
import type { IrrigationScheduleOutput } from '@/ai/flows/irrigation-schedule-flow';
import { generateIrrigationSchedule } from '@/ai/flows/irrigation-schedule-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Droplets, Leaf, Thermometer, CloudRain } from 'lucide-react';
import { addDays, format } from 'date-fns';

export interface DailyForecastInitData {
    day: string;
    maxTempC: number;
    rainfallMM: number;
}

interface IrrigationFormProps {
  onScheduleResult: (result: IrrigationScheduleOutput | null) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  initialForecast?: DailyForecastInitData[];
}

export function IrrigationForm({ onScheduleResult, onLoading, onError, initialForecast }: IrrigationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Create a default 5-day forecast structure
  const today = new Date();
  const defaultForecast = Array.from({ length: 5 }, (_, i) => ({
    day: format(addDays(today, i), 'EEEE'),
    maxTempC: 25,
    rainfallMM: 0,
  }));

  const form = useForm<IrrigationFormData>({
    resolver: zodResolver(irrigationSchema),
    defaultValues: {
      cropType: '',
      location: '',
      forecast: initialForecast || defaultForecast,
    },
  });
  
  const { fields } = useFieldArray({
    control: form.control,
    name: "forecast",
  });

  useEffect(() => {
    setIsClient(true);
    // If initialForecast is passed as a prop, update the form.
    if (initialForecast) {
        form.setValue('forecast', initialForecast, { shouldValidate: true });
    }
  }, [initialForecast, form]);


  async function onSubmit(data: IrrigationFormData) {
    setIsLoading(true);
    onLoading(true);
    onError(null);
    onScheduleResult(null);

    try {
      const result = await generateIrrigationSchedule(data);
      onScheduleResult(result);
      toast({
        title: 'Irrigation Schedule Generated',
        description: `5-day watering plan created for ${data.cropType}.`,
      });
    } catch (error: any) {
      console.error("Irrigation schedule generation error:", error);
      const errorMessage = error.message || 'Could not generate the schedule. Please try again.';
      onError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage,
      });
      onScheduleResult(null);
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  }
  
  if (!isClient) {
     return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="h-6 bg-muted rounded w-3/5 mb-1"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="h-24 bg-muted rounded-lg"></div>
                 <div className="h-40 bg-muted rounded-lg"></div>
            </CardContent>
            <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
            </CardFooter>
        </Card>
     );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Droplets className="mr-2 h-6 w-6 text-primary" />
          Irrigation Inputs
        </CardTitle>
        <CardDescription>Provide crop, soil, and weather details to generate a 5-day watering schedule.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField name="cropType" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Crop Type</FormLabel><FormControl><Input placeholder="e.g., Tomato" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="location" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Nashik, Maharashtra" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="soilType" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Soil Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select soil type" /></SelectTrigger></FormControl>
                    <SelectContent>{soilTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField name="stageOfGrowth" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage of Growth</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select growth stage" /></SelectTrigger></FormControl>
                    <SelectContent>{growthStages.map(stage => <SelectItem key={stage} value={stage}>{stage}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 border-b pb-2">5-Day Weather Forecast</h3>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-3 gap-3 items-end p-3 border rounded-md bg-muted/30">
                    <p className="font-medium col-span-3 sm:col-span-1">{field.day}</p>
                    <div className="col-span-3 sm:col-span-2 grid grid-cols-2 gap-3">
                       <FormField name={`forecast.${index}.maxTempC`} control={form.control} render={({ field: tempField }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-xs"><Thermometer className="mr-1 h-3 w-3" /> Temp (°C)</FormLabel>
                          <FormControl><Input type="number" {...tempField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField name={`forecast.${index}.rainfallMM`} control={form.control} render={({ field: rainField }) => (
                        <FormItem>
                          <FormLabel className="flex items-center text-xs"><CloudRain className="mr-1 h-3 w-3" /> Rain (mm)</FormLabel>
                          <FormControl><Input type="number" {...rainField} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Schedule...</> ) : ( 'Generate Irrigation Schedule' )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
