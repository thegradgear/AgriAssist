
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
import { useState, useRef, type ChangeEvent } from 'react';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<CropRecommendationFormData>({
    resolver: zodResolver(cropRecommendationSchema),
    defaultValues: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      temperature: 25,
      humidity: 60,
      ph: 7,
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
      if (result.nitrogen !== undefined) {
        form.setValue('nitrogen', result.nitrogen, { shouldValidate: true });
        fieldsUpdatedCount++;
      }
      if (result.phosphorus !== undefined) {
        form.setValue('phosphorus', result.phosphorus, { shouldValidate: true });
        fieldsUpdatedCount++;
      }
      if (result.potassium !== undefined) {
        form.setValue('potassium', result.potassium, { shouldValidate: true });
        fieldsUpdatedCount++;
      }
      if (result.ph !== undefined) {
        form.setValue('ph', result.ph, { shouldValidate: true });
        fieldsUpdatedCount++;
      }

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

  return (
    <div className="space-y-8">
       <Card className="shadow-lg bg-accent/20 border-accent">
         <CardHeader>
           <CardTitle className="flex items-center">
             <Sparkles className="mr-2 h-5 w-5 text-primary" />
             Automate with Soil Health Card
           </CardTitle>
           <CardDescription>
             Upload an image of your Soil Health Card to automatically fill in the N, P, K, and pH values below.
           </CardDescription>
         </CardHeader>
         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
           <div className="space-y-4">
             <Input
                id="soil-card-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="block w-full h-auto py-0 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isScanning}
                suppressHydrationWarning
              />
              <Button onClick={handleScanCard} className="w-full" disabled={!imageFile || isScanning} suppressHydrationWarning>
                {isScanning ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning Card...</>
                ) : (
                  <><ScanLine className="mr-2 h-4 w-4" /> Scan Card & Fill Form</>
                )}
              </Button>
           </div>
            <div className="relative group">
              {imagePreviewUrl ? (
                <>
                  <Image
                    src={imagePreviewUrl}
                    alt="Soil health card preview"
                    width={400}
                    height={250}
                    className="rounded-md object-contain max-h-[250px] w-full border bg-background"
                    data-ai-hint="soil health card"
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity h-7 w-7"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                    disabled={isScanning}
                    suppressHydrationWarning
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                 <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg bg-muted/50">
                   <div className="text-center text-muted-foreground">
                     <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                     <p className="text-sm">Image Preview</p>
                   </div>
                 </div>
              )}
           </div>
         </CardContent>
       </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline">Enter Soil & Weather Data Manually</CardTitle>
          <CardDescription>Provide details about your soil and local climate for crop suggestions.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="nitrogen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nitrogen (N)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="e.g., 50" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 30" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 40" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 28.5" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 75" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 6.5" {...field} suppressHydrationWarning />
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
                          <Input type="number" step="0.1" placeholder="e.g., 150" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
