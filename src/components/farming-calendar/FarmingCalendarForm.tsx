'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { farmingCalendarSchema, type FarmingCalendarFormData, formatDataForAI } from '@/schemas/farmingCalendarSchema';
import type { FarmingCalendarOutput } from '@/ai/flows/farming-calendar-flow';
import { generateFarmingCalendar } from '@/ai/flows/farming-calendar-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, CalendarIcon, MapPin, Trees, Leaf, CheckSquare } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

interface FarmingCalendarFormProps {
  onCalendarResult: (result: FarmingCalendarOutput | null) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky", "Not Sure"] as const;
const farmingPractices = ["Conventional", "Organic", "Integrated Pest Management (IPM)", "Other"] as const;

export function FarmingCalendarForm({ onCalendarResult, onLoading, onError }: FarmingCalendarFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FarmingCalendarFormData>({
    resolver: zodResolver(farmingCalendarSchema),
    defaultValues: {
      cropName: '',
      location: '',
      plantingDate: new Date(),
      soilType: undefined,
      farmingPractice: undefined,
    },
  });

  async function onSubmit(data: FarmingCalendarFormData) {
    setIsLoading(true);
    onLoading(true);
    onError(null);
    onCalendarResult(null);

    try {
      const aiInput = formatDataForAI(data);
      const result = await generateFarmingCalendar(aiInput);
      onCalendarResult(result);
      toast({
        title: 'Farming Calendar Generated',
        description: `Schedule created for ${data.cropName}.`,
      });
    } catch (error: any) {
      console.error("Farming calendar generation error:", error);
      const errorMessage = error.message || 'Could not generate farming calendar. Please try again.';
      onError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage,
      });
      onCalendarResult(null);
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <CalendarIcon className="mr-2 h-6 w-6 text-primary" />
          Calendar Inputs
        </CardTitle>
        <CardDescription>Enter details to generate a personalized farming schedule.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="cropName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Trees className="mr-2 h-4 w-4 text-muted-foreground" />Crop Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tomato, Wheat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" />Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Pune, Maharashtra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plantingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />Approx. Planting Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="soilType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Leaf className="mr-2 h-4 w-4 text-muted-foreground" />Soil Type (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select soil type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {soilTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farmingPractice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />Farming Practice (Optional)</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farming practice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {farmingPractices.map(practice => (
                        <SelectItem key={practice} value={practice}>{practice}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Schedule...
                </>
              ) : (
                'Generate Farming Calendar'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
