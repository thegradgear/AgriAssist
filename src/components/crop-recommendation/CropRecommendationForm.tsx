// src/components/crop-recommendation/CropRecommendationForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cropRecommendationSchema, type CropRecommendationFormData } from '@/schemas/cropRecommendationSchema';
import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation';
import { recommendCrops } from '@/ai/flows/crop-recommendation';
import { digitizeSoilCard } from '@/ai/flows/digitize-soil-card-flow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ScanLine, UploadCloud, Sparkles, XCircle } from 'lucide-react';
import Image from 'next/image';

interface CropRecommendationFormProps {
  onRecommendationResult: (result: CropRecommendationOutput) => void;
  onRecommendationLoading: (loading: boolean) => void;
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function CropRecommendationForm({ onRecommendationResult, onRecommendationLoading }: CropRecommendationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<CropRecommendationFormData>({
    resolver: zodResolver(cropRecommendationSchema),
    defaultValues: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      ph: 7,
      ec: 0,
      organicCarbon: 0,
      sulphur: 0,
      zinc: 0,
      boron: 0,
      iron: 0,
      manganese: 0,
      copper: 0,
      temperature: 25,
      humidity: 60,
      rainfall: 100,
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a JPG, PNG, or WEBP image.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { 
         toast({ variant: 'destructive', title: 'File Too Large', description: 'Please upload an image smaller than 5MB.' });
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };
  
  const handleScanCard = async () => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please upload an image of your Soil Health Card first.' });
      return;
    }
    
    setIsScanning(true);
    
    try {
      const photoDataUri = await fileToDataUri(imageFile);
      const result = await digitizeSoilCard({ photoDataUri });
      
      let fieldsUpdatedCount = 0;
      if (result.nitrogen !== undefined) { form.setValue('nitrogen', result.nitrogen, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.phosphorus !== undefined) { form.setValue('phosphorus', result.phosphorus, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.potassium !== undefined) { form.setValue('potassium', result.potassium, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.ph !== undefined) { form.setValue('ph', result.ph, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.ec !== undefined) { form.setValue('ec', result.ec, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.organicCarbon !== undefined) { form.setValue('organicCarbon', result.organicCarbon, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.sulphur !== undefined) { form.setValue('sulphur', result.sulphur, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.zinc !== undefined) { form.setValue('zinc', result.zinc, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.boron !== undefined) { form.setValue('boron', result.boron, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.iron !== undefined) { form.setValue('iron', result.iron, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.manganese !== undefined) { form.setValue('manganese', result.manganese, { shouldValidate: true }); fieldsUpdatedCount++; }
      if (result.copper !== undefined) { form.setValue('copper', result.copper, { shouldValidate: true }); fieldsUpdatedCount++; }

      if (fieldsUpdatedCount > 0) {
        toast({ title: 'Scan Successful', description: `${fieldsUpdatedCount} field(s) have been automatically filled.` });
      } else {
         toast({ variant: 'destructive', title: 'No Data Found', description: 'Could not extract any soil data from the image. Please try a clearer image or enter values manually.' });
      }

    } catch (error: any) {
        console.error("Soil card digitization error:", error);
        toast({ variant: 'destructive', title: 'Scan Failed', description: error.message || 'Could not process the image. Please try again.' });
    } finally {
        setIsScanning(false);
    }
  };

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
      onRecommendationResult({ recommendedCrops: '', reasoning: ''});
    } finally {
      setIsLoading(false);
      onRecommendationLoading(false);
    }
  }

  if (!isClient) {
    return (
      <div className="space-y-8 animate-pulse">
        <Card className="shadow-lg bg-accent/20 border-accent">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-48 w-full rounded-md" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-5 w-4/5 mt-2" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
            <div className="space-y-4">
                <Skeleton className="h-5 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-1/3" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Card className="shadow-lg bg-accent/20 border-accent">
         <CardHeader>
           <CardTitle className="flex items-center">
             <Sparkles className="mr-2 h-5 w-5 text-primary" />
             Automate with Soil Health Card
           </CardTitle>
           <CardDescription>
             Upload a clear image of your Soil Health Card, then click scan to autofill the soil parameters below.
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Uploader Column */}
              <div
                className="relative flex flex-col justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-background/70 transition-colors"
                onClick={() => !isScanning && fileInputRef.current?.click()}
              >
                <input
                  id="soil-card-image"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isScanning}
                />
                <div className="text-center">
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold text-primary">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, or WEBP (max 5MB)
                  </p>
                </div>
              </div>
              
              {/* Preview Column */}
              <div className="relative group w-full h-48">
                {imagePreviewUrl ? (
                  <>
                    <Image
                      src={imagePreviewUrl}
                      alt="Soil health card preview"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md border bg-background"
                      data-ai-hint="soil health card"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity h-7 w-7"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                      disabled={isScanning}
                      suppressHydrationWarning
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="text-center text-muted-foreground">
                      <ScanLine className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm">Image Preview</p>
                      <p className="text-xs">Your upload will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Scan Button */}
            <div className="pt-2">
              <Button onClick={handleScanCard} className="w-full" disabled={!imageFile || isScanning} suppressHydrationWarning>
                {isScanning ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning Card...</>
                ) : (
                  <><ScanLine className="mr-2 h-4 w-4" /> Scan Card & Fill Form</>
                )}
              </Button>
            </div>
         </CardContent>
       </Card>

      <Card className="shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Enter Soil & Weather Data Manually</CardTitle>
              <CardDescription>Provide details about your soil and local climate for crop suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Soil Parameters</h3>
                 <div className="space-y-6">
                    <div>
                        <h4 className="text-base font-semibold mb-3">Primary Parameters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="ph" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>pH</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 6.5" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="ec" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>EC (dS/m)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="e.g., 0.5" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="organicCarbon" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organic Carbon (%)</FormLabel>
                                    <FormControl><Input type="number" step="0.01" placeholder="e.g., 0.75" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="nitrogen" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nitrogen (kg/ha)</FormLabel>
                                    <FormControl><Input type="number" step="1" placeholder="e.g., 120" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="phosphorus" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phosphorus (kg/ha)</FormLabel>
                                    <FormControl><Input type="number" step="1" placeholder="e.g., 50" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="potassium" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Potassium (kg/ha)</FormLabel>
                                    <FormControl><Input type="number" step="1" placeholder="e.g., 50" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                     <div>
                        <h4 className="text-base font-semibold mb-3">Secondary &amp; Micro Nutrients</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <FormField control={form.control} name="sulphur" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sulphur (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 15" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="zinc" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zinc (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 0.6" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="boron" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Boron (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 0.5" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="iron" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Iron (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 4.5" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="manganese" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manganese (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.0" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="copper" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Copper (ppm)</FormLabel>
                                    <FormControl><Input type="number" step="0.1" placeholder="e.g., 0.2" {...field} suppressHydrationWarning /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </div>
                 </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Climate Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="temperature" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature (°C)</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder="e.g., 28.5" {...field} suppressHydrationWarning /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="humidity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidity (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder="e.g., 75" {...field} suppressHydrationWarning /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rainfall" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rainfall (mm)</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder="e.g., 150" {...field} suppressHydrationWarning /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full md:w-auto" disabled={isLoading || isScanning} suppressHydrationWarning>
                    {isLoading ? (
                      <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recommending... </>
                    ) : (
                      'Get Crop Recommendations'
                    )}
                  </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
