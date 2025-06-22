
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { costCalculatorSchema, type CostCalculatorFormData, type CostItemFormData, defaultCostItems as staticDefaultCostItems } from '@/schemas/costCalculatorSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, PlusCircle, Calculator, Leaf, IndianRupee, Scaling } from 'lucide-react';

export interface CalculatedCosts {
  totalCost: number;
  totalRevenue: number;
  profitOrLoss: number;
  profitMargin: number; // Percentage
  costBreakdown: { name: string; amount: number; percentage: number }[];
  cropName: string;
  area: number;
  areaUnit: string;
  // New break-even fields
  breakEvenYield: number;
  breakEvenYieldUnit: string;
  breakEvenPrice: number;
  breakEvenPriceUnit: string;
}

interface CostCalculatorFormProps {
  onCalculated: (results: CalculatedCosts | null) => void;
  onFormSubmit: (inputs: CostCalculatorFormData | null) => void;
  onLoading: (loading: boolean) => void;
  initialData?: Partial<CostCalculatorFormData>;
}

const areaUnits = ['acre', 'hectare'] as const;
const yieldUnits = ['kg', 'quintal', 'tonne'] as const;

const yieldConversionToKg: Record<typeof yieldUnits[number], number> = {
  kg: 1,
  quintal: 100,
  tonne: 1000,
};
const areaConversionToAcre: Record<typeof areaUnits[number], number> = {
  acre: 1,
  hectare: 2.47105, 
};


export function CostCalculatorForm({ onCalculated, onFormSubmit, onLoading, initialData }: CostCalculatorFormProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const form = useForm<CostCalculatorFormData>({
    resolver: zodResolver(costCalculatorSchema),
    defaultValues: initialData || {
      cropName: '',
      area: 1,
      areaUnit: 'acre',
      costItems: [],
      expectedYield: 1000,
      yieldUnit: 'kg',
      yieldPerAreaUnit: 'acre',
      expectedMarketPrice: 20,
      pricePerYieldUnit: 'kg',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "costItems",
  });

  useEffect(() => {
    setIsClient(true);
    if (!initialData && form.getValues('costItems').length === 0) {
      const clientDefaultCostItems = staticDefaultCostItems.map(item => ({
        ...item,
        id: crypto.randomUUID(),
      }));
      replace(clientDefaultCostItems);
    }
  }, [form, initialData, replace]);


  function onSubmit(data: CostCalculatorFormData) {
    onLoading(true);
    onFormSubmit(data);
    
    try {
      const totalCultivationAreaInAcres = data.area * areaConversionToAcre[data.areaUnit];
      const totalCost = data.costItems.reduce((acc, item) => acc + (item.costPerUnit * item.quantity), 0);

      const yieldInKg = data.expectedYield * yieldConversionToKg[data.yieldUnit];
      const yieldPerAcreInKg = data.yieldPerAreaUnit === 'acre' ? yieldInKg : yieldInKg / areaConversionToAcre.hectare;
      const totalYieldInKg = yieldPerAcreInKg * totalCultivationAreaInAcres;
      
      const priceInKg = data.expectedMarketPrice / yieldConversionToKg[data.pricePerYieldUnit];
      const totalRevenue = totalYieldInKg * priceInKg;
      
      const profitOrLoss = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profitOrLoss / totalRevenue) * 100 : (totalCost > 0 ? -100 : 0) ;

      const costBreakdown = data.costItems.map(item => ({
        name: item.name,
        amount: item.costPerUnit * item.quantity,
        percentage: totalCost > 0 ? ((item.costPerUnit * item.quantity) / totalCost) * 100 : 0,
      }));

      // Break-Even Calculations
      const breakEvenYield = priceInKg > 0 ? totalCost / priceInKg : Infinity;
      const breakEvenPrice = totalYieldInKg > 0 ? totalCost / totalYieldInKg : Infinity;
      
      onCalculated({
        totalCost,
        totalRevenue,
        profitOrLoss,
        profitMargin,
        costBreakdown,
        cropName: data.cropName,
        area: data.area,
        areaUnit: data.areaUnit,
        breakEvenYield: breakEvenYield,
        breakEvenYieldUnit: 'kg',
        breakEvenPrice: breakEvenPrice,
        breakEvenPriceUnit: 'per kg',
      });

      toast({
        title: 'Calculation Complete',
        description: 'Costs and potential profit have been estimated.',
      });

    } catch (error: any) {
      console.error("Calculation error:", error);
      toast({
        variant: 'destructive',
        title: 'Calculation Error',
        description: error.message || 'Failed to calculate costs. Please check inputs.',
      });
      onCalculated(null);
    } finally {
      onLoading(false);
    }
  }

  const handleAddCostItem = () => {
    append({ name: '', costPerUnit: 0, quantity: 0, unit: '', id: crypto.randomUUID() });
  };
  
  if (!isClient && !initialData) {
     return (
        <Card className="shadow-lg w-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center">
                    <Calculator className="mr-2 h-6 w-6 text-primary" />
                    Farming Cost Inputs
                </CardTitle>
                <CardDescription>Enter details about your crop, area, costs, and expected returns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-4 p-4 border rounded-md">
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                    <div className="h-16 bg-muted rounded"></div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="h-20 bg-muted rounded"></div>
                 </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" disabled={true}>Calculate Costs & Profit</Button>
            </CardFooter>
        </Card>
     );
  }


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Calculator className="mr-2 h-6 w-6 text-primary" />
          Farming Cost Inputs
        </CardTitle>
        <CardDescription>Enter details about your crop, area, costs, and expected returns.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
              <FormField
                control={form.control}
                name="cropName"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel className="flex items-center"><Leaf className="mr-1 h-4 w-4 text-muted-foreground"/>Crop Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Wheat" {...field} suppressHydrationWarning/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Scaling className="mr-1 h-4 w-4 text-muted-foreground"/>Area</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 5" {...field} suppressHydrationWarning/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="areaUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger suppressHydrationWarning><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {areaUnits.map(unit => <SelectItem key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold font-headline">Cost Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCostItem} className="flex items-center" suppressHydrationWarning>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-8 gap-3 p-3 border rounded-md relative bg-muted/30">
                  <FormField
                    control={form.control}
                    name={`costItems.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Item Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Seeds" {...field} suppressHydrationWarning/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`costItems.${index}.costPerUnit`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="flex items-center">Cost/Unit <IndianRupee className="ml-1 h-3.5 w-3.5"/></FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 150" {...field} suppressHydrationWarning/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`costItems.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 10" {...field} suppressHydrationWarning/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`costItems.${index}.unit`}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel>Unit</FormLabel>
                        <FormControl><Input placeholder="kg" {...field} suppressHydrationWarning/></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-1 flex items-end">
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-auto sm:mt-0 self-end sm:self-center h-9 w-9" suppressHydrationWarning>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
               {form.formState.errors.costItems && !form.formState.errors.costItems.length && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.costItems.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                <div className="space-y-1">
                    <h4 className="font-medium flex items-center"><Scaling className="mr-1 h-4 w-4 text-muted-foreground"/>Expected Yield</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="expectedYield"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Yield Amount</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 2000" {...field} suppressHydrationWarning/></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="yieldUnit"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Yield Unit</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger suppressHydrationWarning><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {yieldUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="yieldPerAreaUnit"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="sr-only">Per Area Unit</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="mt-2" suppressHydrationWarning><SelectValue placeholder="Per Area Unit" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="acre">per Acre</SelectItem>
                                <SelectItem value="hectare">per Hectare</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <div className="space-y-1">
                     <h4 className="font-medium flex items-center"><IndianRupee className="mr-1 h-4 w-4 text-muted-foreground"/>Expected Market Price</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="expectedMarketPrice"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Market Price</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 25" {...field} suppressHydrationWarning/></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="pricePerYieldUnit"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Price Per Unit</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger suppressHydrationWarning><SelectValue placeholder="Per Unit" /></SelectTrigger></FormControl>
                                <SelectContent>
                                     {yieldUnits.map(unit => <SelectItem key={unit} value={unit}>per {unit}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                 </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} suppressHydrationWarning>
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
              ) : (
                'Calculate Costs & Profit'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
