
'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Microscope, Bug, Leaf, CheckCircle, AlertTriangle, Lightbulb, Loader2, Sparkles, XCircle, HelpCircle } from 'lucide-react';

// Import both flows and their types
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { identifyPestWeed, type IdentifyPestWeedOutput } from '@/ai/flows/identify-pest-weed-flow';

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function CropHealthAnalysisPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  // State for forms
  const [cropType, setCropType] = useState<string>('');
  const [contextNotes, setContextNotes] = useState<string>('');
  
  // State for results
  const [diseaseResult, setDiseaseResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [pestWeedResult, setPestWeedResult] = useState<IdentifyPestWeedOutput | null>(null);
  
  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Reset everything on new image upload
      setDiseaseResult(null); 
      setPestWeedResult(null);
      setError(null);
    }
  };
  
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setDiseaseResult(null);
    setPestWeedResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const handleAnalysis = async (analysisType: 'disease' | 'pest') => {
    if (!imageFile) {
      toast({ variant: 'destructive', title: 'No Image Selected', description: 'Please upload an image to analyze.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setDiseaseResult(null);
    setPestWeedResult(null);

    try {
      const photoDataUri = await fileToDataUri(imageFile);
      
      if (analysisType === 'disease') {
        const diagnosisResult = await diagnoseCropDisease({ photoDataUri, cropType: cropType || undefined });
        setDiseaseResult(diagnosisResult);
        toast({ title: 'Disease Diagnosis Complete', description: diagnosisResult.isDiseased ? `Possible disease: ${diagnosisResult.diseaseName}` : 'Plant appears healthy.' });
      } else { // pest
        const identificationResult = await identifyPestWeed({ photoDataUri, contextNotes: contextNotes || undefined });
        setPestWeedResult(identificationResult);
        toast({ title: 'Pest/Weed Identification Complete', description: `Identified: ${identificationResult.commonName}` });
      }

    } catch (err: any) {
      console.error("Analysis error:", err);
      const errorMessage = err.message || 'Failed to analyze the image. Please try again.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Analysis Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Health Analysis"
        description="Use AI to diagnose crop diseases or identify pests and weeds from an image."
      />
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UploadCloud className="mr-2 h-5 w-5 text-primary" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image file (JPG, PNG, WEBP, max 5MB). For best results, use a clear, focused image.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               <div>
                  <Label htmlFor="crop-image" className="sr-only">Crop Image</Label>
                  <Input
                    id="crop-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="block w-full h-auto py-0 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    suppressHydrationWarning
                  />
               </div>
               {imagePreviewUrl && (
                <div className="relative group">
                  <Image
                    src={imagePreviewUrl}
                    alt="Crop preview"
                    width={500}
                    height={300}
                    className="rounded-md object-contain max-h-[300px] w-full border"
                    data-ai-hint="crop health"
                  />
                   <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemoveImage}
                    aria-label="Remove image"
                    suppressHydrationWarning
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              )}
             </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="disease" className="w-full">
          <TabsList className="h-auto justify-start bg-transparent p-0 gap-3">
            <TabsTrigger
              value="disease"
              className="rounded-full border bg-card px-4 py-2 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Disease Detection
            </TabsTrigger>
            <TabsTrigger
              value="pest"
              className="rounded-full border bg-card px-4 py-2 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Pest & Weed ID
            </TabsTrigger>
          </TabsList>
          
          {/* Disease Detection Tab */}
          <TabsContent value="disease" className="mt-4">
            <Card className="shadow-lg mt-0">
               <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); handleAnalysis('disease'); }} suppressHydrationWarning>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Microscope className="mr-2 h-5 w-5 text-primary" />
                      Analyze for Diseases
                    </CardTitle>
                    <CardDescription>
                      Provide the crop type to improve diagnosis accuracy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="crop-type">Crop Type (Optional)</Label>
                    <Input
                      id="crop-type"
                      type="text"
                      placeholder="e.g., Tomato, Wheat, Rice"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="mt-1"
                      suppressHydrationWarning
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading || !imageFile} suppressHydrationWarning>
                      {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> ) : ( 'Diagnose Disease' )}
                    </Button>
                  </CardFooter>
               </form>
            </Card>
          </TabsContent>

          {/* Pest & Weed ID Tab */}
          <TabsContent value="pest" className="mt-4">
            <Card className="shadow-lg mt-0">
               <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); handleAnalysis('pest'); }} suppressHydrationWarning>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bug className="mr-2 h-5 w-5 text-primary" />
                      Analyze for Pests & Weeds
                    </CardTitle>
                    <CardDescription>
                      Add optional notes about where you found it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Label htmlFor="context-notes">Context Notes (Optional)</Label>
                    <Textarea
                      id="context-notes"
                      placeholder="e.g., Found on the underside of leaves, Growing between corn rows"
                      value={contextNotes}
                      onChange={(e) => setContextNotes(e.target.value)}
                      className="mt-1"
                      suppressHydrationWarning
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading || !imageFile} suppressHydrationWarning>
                      {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> ) : ( 'Identify Pest / Weed' )}
                    </Button>
                  </CardFooter>
               </form>
            </Card>
          </TabsContent>
        </Tabs>

        {isLoading && (
          <Card className="shadow-lg animate-pulse">
            <CardHeader><div className="h-5 bg-muted rounded w-3/4 mb-1"></div></CardHeader>
            <CardContent className="space-y-4"><div className="h-20 bg-muted rounded-md"></div></CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Disease Result Card */}
        {diseaseResult && !isLoading && (
           <Card className={`shadow-lg border-2 ${diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? 'border-destructive/70' : (diseaseResult.diseaseName === "Unable to Diagnose" ? 'border-amber-500/70' : 'border-green-500/70')}`}>
            <CardHeader className={`${diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? 'bg-destructive/10' : (diseaseResult.diseaseName === "Unable to Diagnose" ? 'bg-amber-500/10' : 'bg-green-500/10')}`}>
              <CardTitle className="flex items-center">
                {diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? <AlertTriangle className="mr-2 h-5 w-5 text-destructive" /> : (diseaseResult.diseaseName === "Unable to Diagnose" ? <HelpCircle className="mr-2 h-5 w-5 text-amber-600" /> : <CheckCircle className="mr-2 h-5 w-5 text-green-600" />)}
                Disease Diagnosis Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Status</Label>
                <p className={`text-xl font-bold ${diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? 'text-destructive' : (diseaseResult.diseaseName === "Unable to Diagnose" ? 'text-amber-600' : 'text-green-600')}`}>{diseaseResult.diseaseName}</p>
              </div>
              {diseaseResult.diseaseName !== "Appears Healthy" && diseaseResult.diseaseName !== "Unable to Diagnose" && (
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Confidence</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={diseaseResult.confidence * 100} className="w-full h-2.5" />
                    <span className="text-sm font-semibold text-primary">{(diseaseResult.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Observations</Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">{diseaseResult.description}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Suggested Remedy</Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-primary/10 p-3 rounded-md flex items-start"><Lightbulb className="mr-2 h-4 w-4 text-primary shrink-0 mt-1" /><span>{diseaseResult.remedySuggestion}</span></p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pest/Weed Result Card */}
        {pestWeedResult && !isLoading && (
          <Card className={`shadow-lg border-2 ${pestWeedResult.isHarmful ? 'border-destructive/70' : 'border-green-500/70'}`}>
            <CardHeader className={`${pestWeedResult.isHarmful ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
              <CardTitle className="flex items-center">
                {pestWeedResult.identificationType === 'PEST' ? <Bug className="mr-2 h-5 w-5" /> : <Leaf className="mr-2 h-5 w-5" />}
                Identification Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Identification</Label>
                <p className={`text-xl font-bold ${pestWeedResult.isHarmful ? 'text-destructive' : 'text-green-600'}`}>{pestWeedResult.commonName}</p>
                {pestWeedResult.scientificName && <p className="text-sm text-muted-foreground italic">{pestWeedResult.scientificName}</p>}
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Description</Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">{pestWeedResult.description}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Suggested Management</Label>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line bg-primary/10 p-3 rounded-md flex items-start"><Lightbulb className="mr-2 h-4 w-4 text-primary shrink-0 mt-1" /><span>{pestWeedResult.managementSuggestion}</span></p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Common Disclaimer */}
        {(diseaseResult || pestWeedResult) && !isLoading && (
            <Alert variant="default" className="mt-4 bg-accent/50 border-accent">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="font-semibold text-primary text-base">Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">
                This AI-powered analysis is for informational purposes only. Always verify with local specialists before making treatment decisions.
                </AlertDescription>
            </Alert>
        )}
      </div>
    </div>
  );
}
