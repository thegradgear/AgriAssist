
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Microscope, Leaf, CheckCircle, AlertTriangle, Lightbulb, Loader2, Sparkles, XCircle } from 'lucide-react';
import type { DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { diagnoseCropDisease } from '@/ai/flows/diagnose-crop-disease';

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function CropDiseaseDetectionPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [cropType, setCropType] = useState<string>('');
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or WEBP image.',
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
         toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB.',
        });
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear previous results
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile) {
      toast({
        variant: 'destructive',
        title: 'No Image Selected',
        description: 'Please upload an image of the crop.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const photoDataUri = await fileToDataUri(imageFile);
      const diagnosisResult = await diagnoseCropDisease({
        photoDataUri,
        cropType: cropType || undefined,
      });
      setResult(diagnosisResult);
      toast({
        title: 'Diagnosis Complete',
        description: diagnosisResult.isDiseased ? `Possible disease: ${diagnosisResult.diseaseName}` : 'Plant appears healthy.',
      });
    } catch (err: any) {
      console.error("Diagnosis error:", err);
      const errorMessage = err.message || 'Failed to analyze the image. Please try again.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Diagnosis Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Disease Detection"
        description="Upload an image of your crop to get an AI-powered disease diagnosis and suggestions."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline flex items-center">
              <UploadCloud className="mr-2 h-6 w-6 text-primary" />
              Upload Crop Image
            </CardTitle>
            <CardDescription>
              Select an image file (JPG, PNG, WEBP, max 5MB). For best results, use a clear image focusing on the affected area.
            </CardDescription>
          </CardHeader>
          <Form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="crop-image" className="sr-only">Crop Image</Label>
                <Input
                  id="crop-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              {imagePreviewUrl && (
                <div className="mt-4 relative group">
                  <Image
                    src={imagePreviewUrl}
                    alt="Crop preview"
                    width={500}
                    height={300}
                    className="rounded-md object-contain max-h-[300px] w-full border"
                    data-ai-hint="crop disease"
                  />
                   <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="crop-type">Crop Type (Optional)</Label>
                <Input
                  id="crop-type"
                  type="text"
                  placeholder="e.g., Tomato, Wheat, Rice"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Providing the crop type can improve diagnosis accuracy.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading || !imageFile}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Microscope className="mr-2 h-4 w-4" />
                    Diagnose Crop
                  </>
                )}
              </Button>
            </CardFooter>
          </Form>
        </Card>

        {isLoading && (
          <Card className="shadow-lg animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-40 bg-muted rounded-md"></div>
              <div className="h-5 bg-muted rounded w-full"></div>
              <div className="h-5 bg-muted rounded w-5/6"></div>
              <div className="h-5 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && !isLoading && (
          <Card className={`shadow-lg border-2 ${result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? 'border-destructive/70' : (result.diseaseName === "Unable to Diagnose" ? 'border-amber-500/70' : 'border-green-500/70')}`}>
            <CardHeader className={`${result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? 'bg-destructive/10' : (result.diseaseName === "Unable to Diagnose" ? 'bg-amber-500/10' : 'bg-green-500/10')}`}>
              <CardTitle className="font-headline flex items-center">
                {result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? <AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> : (result.diseaseName === "Unable to Diagnose" ? <HelpCircle className="mr-2 h-6 w-6 text-amber-600" /> : <CheckCircle className="mr-2 h-6 w-6 text-green-600" />)}
                AI Diagnosis Result
              </CardTitle>
              <CardDescription>
                {result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? 'A potential issue has been detected.' : (result.diseaseName === "Unable to Diagnose" ? 'Could not determine the issue.' : 'The crop appears to be healthy.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                <p className={`text-xl font-bold ${result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? 'text-destructive' : (result.diseaseName === "Unable to Diagnose" ? 'text-amber-600' : 'text-green-600')}`}>
                  {result.diseaseName}
                </p>
              </div>

              {result.diseaseName !== "Appears Healthy" && result.diseaseName !== "Unable to Diagnose" && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Confidence</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={result.confidence * 100} className="w-full h-2.5" aria-label={`Confidence: ${(result.confidence * 100).toFixed(0)}%`} />
                    <span className="text-sm font-semibold text-primary">{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Observations</Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">{result.description}</p>
              </div>

              <div>
                <Label className="text-xs font-semibold text-muted-foreground">
                    {result.isDiseased && result.diseaseName !== "Unable to Diagnose" ? 'Suggested Remedy / Action' : (result.diseaseName === "Unable to Diagnose" ? 'Next Steps' : 'General Care Tip')}
                </Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-primary/10 p-3 rounded-md flex items-start">
                  <Lightbulb className="mr-2 h-4 w-4 text-primary shrink-0 mt-1" />
                  <span>{result.remedySuggestion}</span>
                </p>
              </div>
               <Alert variant="default" className="mt-4 bg-accent/50 border-accent">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">
                  This AI diagnosis is for informational purposes only and should not replace consultation with a qualified agricultural expert. Always verify with local specialists before making treatment decisions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
