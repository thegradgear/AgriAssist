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
import { Loader2, ScanLine, UploadCloud, Sparkles, XCircle, Camera, Video } from 'lucide-react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CropRecommendationFormProps {
  onRecommendationResult: (result: CropRecommendationOutput | null) => void;
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

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isCameraOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOpen, toast]);

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

  const processFile = (file: File) => {
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
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
              if (blob) {
                 const capturedFile = new File([blob], "capture.jpg", { type: "image/jpeg" });
                 processFile(capturedFile);
              }
            }, 'image/jpeg', 0.95);
        }
        setIsCameraOpen(false);
    }
  };

  const handleScanCard = async () => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please upload or capture an image of your Soil Health Card first.' });
      return;
    }
    
    setIsScanning(true);
    
    try {
        const photoDataUri = await fileToDataUri(imageFile);
        const result = await digitizeSoilCard({ photoDataUri });
        
        if (result.success) {
            const data = result.data;
            let fieldsUpdatedCount = 0;
            if (data.nitrogen !== undefined) { form.setValue('nitrogen', data.nitrogen, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.phosphorus !== undefined) { form.setValue('phosphorus', data.phosphorus, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.potassium !== undefined) { form.setValue('potassium', data.potassium, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.ph !== undefined) { form.setValue('ph', data.ph, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.ec !== undefined) { form.setValue('ec', data.ec, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.organicCarbon !== undefined) { form.setValue('organicCarbon', data.organicCarbon, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.sulphur !== undefined) { form.setValue('sulphur', data.sulphur, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.zinc !== undefined) { form.setValue('zinc', data.zinc, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.boron !== undefined) { form.setValue('boron', data.boron, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.iron !== undefined) { form.setValue('iron', data.iron, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.manganese !== undefined) { form.setValue('manganese', data.manganese, { shouldValidate: true }); fieldsUpdatedCount++; }
            if (data.copper !== undefined) { form.setValue('copper', data.copper, { shouldValidate: true }); fieldsUpdatedCount++; }

            if (fieldsUpdatedCount > 0) {
                toast({ title: 'Scan Successful', description: `${fieldsUpdatedCount} field(s) have been automatically filled.` });
            } else {
                toast({ variant: 'destructive', title: 'No Data Found', description: 'Could not extract any soil data from the image. Please try a clearer image or enter values manually.' });
            }
        } else {
            // Handle the structured error from the server action
            toast({ variant: 'destructive', title: 'Scan Failed', description: result.error });
        }
    } catch (e: any) {
        // Handle unexpected system/network errors
        console.error("An unexpected error occurred during scan:", e);
        toast({ variant: 'destructive', title: 'Scan Error', description: "An unexpected error occurred. Please check your connection and try again." });
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
             Upload or capture an image of your Soil Health Card, then scan to autofill the soil parameters below.
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="soil-card-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground font-semibold">Upload from File</p>
                </div>
                <input id="soil-card-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/webp" disabled={isScanning || isCameraOpen} />
              </label>

              <Button
                type="button"
                variant="outline"
                className="h-24 text-base"
                onClick={() => setIsCameraOpen(true)}
                disabled={isScanning || isCameraOpen}
              >
                <Camera className="mr-2 h-6 w-6"/> Use Camera
              </Button>
            </div>

            {imagePreviewUrl && (
              <div className="relative group w-full max-w-md mx-auto">
                <Image
                  src={imagePreviewUrl}
                  alt="Soil health card preview"
                  width={400}
                  height={250}
                  className="rounded-md border bg-background object-contain w-full"
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
              </div>
            )}
            
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
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Live Camera</DialogTitle>
                <DialogDescription>Position your Soil Health Card in the frame and click capture.</DialogDescription>
            </DialogHeader>
            <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
                 {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-4 rounded-md">
                        <Video className="h-12 w-12 mb-4"/>
                        <p className="text-lg font-semibold">Camera Access Denied</p>
                        <p className="text-sm text-center">Please enable camera permissions in your browser settings to use this feature.</p>
                    </div>
                 )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCameraOpen(false)} suppressHydrationWarning>Cancel</Button>
                <Button onClick={handleCapture} disabled={!hasCameraPermission} suppressHydrationWarning>
                    <Camera className="mr-2 h-4 w-4" /> Capture Photo
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
