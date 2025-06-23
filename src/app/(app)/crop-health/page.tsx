'use client';

import { useState, useRef, type ChangeEvent, type FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db, addDoc, collection, serverTimestamp } from '@/lib/firebase';
import { UploadCloud, Microscope, Bug, Leaf, CheckCircle, AlertTriangle, Lightbulb, Loader2, Sparkles, XCircle, HelpCircle, Camera, Video, Save } from 'lucide-react';

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

const dataUriToBlob = (dataURI: string): Blob => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

export default function CropHealthAnalysisPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [cropType, setCropType] = useState<string>('');
  const [contextNotes, setContextNotes] = useState<string>('');
  
  const [diseaseResult, setDiseaseResult] = useState<DiagnoseCropDiseaseOutput | null>(null);
  const [pestWeedResult, setPestWeedResult] = useState<IdentifyPestWeedOutput | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('disease');
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      // Cleanup: stop video stream when modal is closed
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOpen, toast]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

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
      setDiseaseResult(null); 
      setPestWeedResult(null);
      setError(null);
  }

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

  const handleAnalysis = async () => {
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
      
      if (activeTab === 'disease') {
        const diagnosisResult = await diagnoseCropDisease({ photoDataUri, cropType: cropType || undefined });
        setDiseaseResult(diagnosisResult);
        toast({ title: 'Disease Diagnosis Complete', description: diagnosisResult.isDiseased ? `Possible disease: ${diagnosisResult.diseaseName}` : 'Plant appears healthy.' });
      } else {
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

  const resizeImageForStorage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = document.createElement("img");
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.8)); // 80% quality JPEG
                } else {
                    reject(new Error("Could not get canvas context"));
                }
            };
        };
    });
  };

  const handleSaveAnalysis = async () => {
     if (!user) {
        toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to save an analysis.' });
        return;
     }
     if (!imageFile || (!diseaseResult && !pestWeedResult)) {
        toast({ variant: 'destructive', title: 'No Result to Save', description: 'Please perform an analysis before saving.' });
        return;
     }

     setIsSaving(true);
     try {
        const resizedPhotoDataUri = await resizeImageForStorage(imageFile);
        
        const analysisData = {
            userId: user.uid,
            createdAt: serverTimestamp(),
            analysisType: activeTab,
            photoDataUri: resizedPhotoDataUri,
            result: activeTab === 'disease' ? diseaseResult : pestWeedResult,
            inputs: activeTab === 'disease' ? { cropType } : { contextNotes },
        };
        await addDoc(collection(db, 'users', user.uid, 'healthAnalyses'), analysisData);

        toast({ title: 'Analysis Saved', description: 'Your analysis has been saved to your profile.' });

     } catch (err) {
        console.error('Error saving analysis:', err);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'There was an error saving your analysis.' });
     } finally {
        setIsSaving(false);
     }
  };

  const renderResultCard = () => {
    if (isLoading) {
      return <Card className="shadow-lg animate-pulse"><CardHeader><div className="h-5 bg-muted rounded w-3/4 mb-1"></div></CardHeader><CardContent className="space-y-4"><div className="h-20 bg-muted rounded-md"></div></CardContent></Card>;
    }
    if (error) {
      return <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Analysis Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }
    if (diseaseResult) {
       const severityValue = diseaseResult.severity === 'Low' ? 33 : diseaseResult.severity === 'Medium' ? 66 : diseaseResult.severity === 'High' ? 100 : 0;
       return (
         <Card className={`shadow-lg border-2 ${diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? 'border-destructive/70' : (diseaseResult.diseaseName === "Unable to Diagnose" ? 'border-amber-500/70' : 'border-green-500/70')}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center">
                        {diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? <AlertTriangle className="mr-2 h-5 w-5 text-destructive" /> : (diseaseResult.diseaseName === "Unable to Diagnose" ? <HelpCircle className="mr-2 h-5 w-5 text-amber-600" /> : <CheckCircle className="mr-2 h-5 w-5 text-green-600" />)}
                        Diagnosis Result
                    </CardTitle>
                    {user && <Button size="sm" onClick={handleSaveAnalysis} disabled={isSaving} suppressHydrationWarning>{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>Save</>}</Button>}
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Status</p>
                <p className={`text-xl font-bold ${diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" ? 'text-destructive' : (diseaseResult.diseaseName === "Unable to Diagnose" ? 'text-amber-600' : 'text-green-600')}`}>{diseaseResult.diseaseName}</p>
              </div>
              {diseaseResult.isDiseased && diseaseResult.diseaseName !== "Unable to Diagnose" && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Severity</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={severityValue} className="w-full h-2.5" />
                    <span className="text-sm font-semibold text-primary">{diseaseResult.severity}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Detection Explanation</p>
                <div className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">
                    {diseaseResult.detectionExplanation.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Remedies & Solutions</p>
                <ul className="text-sm text-foreground mt-1 list-disc list-inside bg-primary/10 p-3 rounded-md space-y-1">
                    {diseaseResult.remedies.map((remedy, i) => <li key={i}>{remedy}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
       );
    }
     if (pestWeedResult) {
       return (
          <Card className={`shadow-lg border-2 ${pestWeedResult.isHarmful ? 'border-destructive/70' : 'border-green-500/70'}`}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center">
                        {pestWeedResult.identificationType === 'PEST' ? <Bug className="mr-2 h-5 w-5" /> : <Leaf className="mr-2 h-5 w-5" />}
                        Identification Result
                    </CardTitle>
                    {user && <Button size="sm" onClick={handleSaveAnalysis} disabled={isSaving} suppressHydrationWarning>{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>Save</>}</Button>}
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Identification</p>
                <p className={`text-xl font-bold ${pestWeedResult.isHarmful ? 'text-destructive' : 'text-green-600'}`}>{pestWeedResult.commonName}</p>
                {pestWeedResult.scientificName && <p className="text-sm text-muted-foreground italic">{pestWeedResult.scientificName}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Detection Explanation</p>
                <div className="text-sm text-foreground mt-1 whitespace-pre-line bg-muted/50 p-3 rounded-md">
                   {pestWeedResult.detectionExplanation.split('\n').map((line, index) => <p key={index}>{line}</p>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Management Solutions</p>
                <ul className="text-sm text-foreground mt-1 list-disc list-inside bg-primary/10 p-3 rounded-md space-y-1">
                    {pestWeedResult.managementSolutions.map((solution, i) => <li key={i}>{solution}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
       );
    }
    return null;
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Crop Health Analysis"
        description="Use AI to diagnose crop diseases or identify pests and weeds from an image or live camera feed."
      />
      
      <div className="grid grid-cols-1 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary" />Upload or Capture Image</CardTitle>
            <CardDescription>Select a file (JPG, PNG, max 5MB) or use your camera. For best results, use a clear image of the affected plant part.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                htmlFor="crop-image-upload"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-background/50 hover:bg-background/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center">
                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-foreground font-semibold">Upload from File</p>
                </div>
                <input id="crop-image-upload" type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange} accept="image/jpeg,image/png,image/webp" disabled={isCameraOpen} />
              </label>

              <Button
                type="button"
                variant="outline"
                className="h-24 text-base"
                onClick={() => setIsCameraOpen(true)}
                disabled={isCameraOpen}
                suppressHydrationWarning
              >
                <Camera className="mr-2 h-6 w-6"/> Use Camera
              </Button>
            </div>

            {imagePreviewUrl && (
              <div className="relative group w-full max-w-md mx-auto">
                <Image
                  src={imagePreviewUrl}
                  alt="Crop preview"
                  width={400}
                  height={250}
                  className="rounded-md border bg-background object-contain w-full"
                  data-ai-hint="crop health"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                  suppressHydrationWarning
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-auto justify-start bg-transparent p-0 gap-3">
            <TabsTrigger value="disease" className="rounded-full border bg-card px-4 py-2 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Disease Detection</TabsTrigger>
            <TabsTrigger value="pest" className="rounded-full border bg-card px-4 py-2 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pest & Weed ID</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <Card className="shadow-lg mt-0">
              <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); handleAnalysis(); }}>
                <TabsContent value="disease" forceMount={true} className={activeTab === 'disease' ? 'block' : 'hidden'}>
                  <CardHeader><CardTitle className="flex items-center"><Microscope className="mr-2 h-5 w-5 text-primary" />Analyze for Diseases</CardTitle><CardDescription>Provide the crop type to improve diagnosis accuracy.</CardDescription></CardHeader>
                  <CardContent>
                    <label htmlFor="crop-type" className='text-sm font-medium mb-1 block'>Crop Type (Optional)</label>
                    <Textarea id="crop-type" placeholder="e.g., Tomato, Wheat, Rice" value={cropType} onChange={(e) => setCropType(e.target.value)} className="mt-1" suppressHydrationWarning />
                  </CardContent>
                </TabsContent>
                <TabsContent value="pest" forceMount={true} className={activeTab === 'pest' ? 'block' : 'hidden'}>
                  <CardHeader><CardTitle className="flex items-center"><Bug className="mr-2 h-5 w-5 text-primary" />Analyze for Pests & Weeds</CardTitle><CardDescription>Add optional notes about where you found it.</CardDescription></CardHeader>
                  <CardContent>
                    <label htmlFor="context-notes" className='text-sm font-medium mb-1 block'>Context Notes (Optional)</label>
                    <Textarea id="context-notes" placeholder="e.g., Found on the underside of leaves" value={contextNotes} onChange={(e) => setContextNotes(e.target.value)} className="mt-1" suppressHydrationWarning />
                  </CardContent>
                </TabsContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading || !imageFile} suppressHydrationWarning>
                    {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> ) : 'Analyze Image'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </Tabs>

        {renderResultCard()}

        {(diseaseResult || pestWeedResult) && !isLoading && (
            <Alert variant="default" className="mt-4 bg-accent/50 border-accent">
                <Sparkles className="h-4 w-4 text-primary" /><AlertTitle className="font-semibold text-primary text-base">Disclaimer</AlertTitle>
                <AlertDescription className="text-xs">This AI-powered analysis is for informational purposes only. Always verify with local specialists before making treatment decisions.</AlertDescription>
            </Alert>
        )}
      </div>
      
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Live Camera</DialogTitle>
                <DialogDescription>Position the affected area of the plant in the frame and click capture.</DialogDescription>
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
