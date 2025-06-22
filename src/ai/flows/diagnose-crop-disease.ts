
'use server';
/**
 * @fileOverview A crop disease diagnosis AI agent.
 *
 * - diagnoseCropDisease - A function that handles the crop disease diagnosis process.
 * - DiagnoseCropDiseaseInput - The input type for the diagnoseCropDisease function.
 * - DiagnoseCropDiseaseOutput - The return type for the diagnoseCropDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnoseCropDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  cropType: z.string().optional().describe('The type of the crop (e.g., Tomato, Wheat). Optional.'),
});
export type DiagnoseCropDiseaseInput = z.infer<typeof DiagnoseCropDiseaseInputSchema>;

const DiagnoseCropDiseaseOutputSchema = z.object({
  isDiseased: z.boolean().describe('Whether or not the plant appears to be diseased based on the image.'),
  diseaseName: z.string().describe('The common name of the identified disease, or "Appears Healthy" if no disease is detected.'),
  confidence: z.number().min(0).max(1).describe('The confidence level (0.0 to 1.0) of the disease diagnosis. Less relevant if healthy.'),
  severity: z.enum(['Low', 'Medium', 'High', 'N/A']).describe('The estimated severity of the infection. Set to "N/A" if not applicable (e.g., healthy or unable to diagnose).'),
  detectionExplanation: z.string().describe("A step-by-step explanation of the key visual factors (symptoms) that led to the diagnosis. If healthy, explain why it appears so."),
  remedies: z.array(z.string()).describe("A list of actionable remedies or solutions. Include organic and chemical options if applicable. If healthy, provide a general care tip."),
});
export type DiagnoseCropDiseaseOutput = z.infer<typeof DiagnoseCropDiseaseOutputSchema>;

export async function diagnoseCropDisease(input: DiagnoseCropDiseaseInput): Promise<DiagnoseCropDiseaseOutput> {
  return diagnoseCropDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropDiseasePrompt',
  input: {schema: DiagnoseCropDiseaseInputSchema},
  output: {schema: DiagnoseCropDiseaseOutputSchema},
  prompt: `You are an expert plant pathologist specializing in diagnosing crop diseases from images.

You will analyze the provided image of a crop and an optional crop type description.
Image of the crop: {{media url=photoDataUri}}
{{#if cropType}}
Crop Type (as stated by farmer): {{{cropType}}}
{{/if}}

Based on the visual symptoms in the image:
1.  **isDiseased**: Determine if the plant appears diseased.
2.  **diseaseName**: If diseased, identify the common name. If healthy, set to "Appears Healthy".
3.  **confidence**: Provide a confidence score (0.0-1.0) for the diagnosis.
4.  **severity**: If diseased, estimate the infection severity as 'Low', 'Medium', or 'High' based on the extent of symptoms visible. If healthy or unable to diagnose, set to 'N/A'.
5.  **detectionExplanation**: Provide a detailed, step-by-step explanation of the key visual symptoms observed (e.g., "Step 1: Observed yellow, circular spots on the lower leaves. Step 2: Some spots show a 'halo' effect, typical of early blight...") that led to your conclusion. Each step must be on a new line, separated by a newline character.
6.  **remedies**: Provide a list of actionable remedies. For each remedy, be specific. For example: "Organic Remedy: Spray a solution of neem oil (2ml per liter of water) every 7-10 days." or "Chemical Remedy: Apply a copper-based fungicide, such as Mancozeb, following label instructions."

If the image quality is poor or it's not a plant, set 'isDiseased' to false, 'diseaseName' to "Unable to Diagnose", confidence to 0, severity to "N/A", and explain the issue in 'detectionExplanation'.
`,
});

const diagnoseCropDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnoseCropDiseaseFlow',
    inputSchema: DiagnoseCropDiseaseInputSchema,
    outputSchema: DiagnoseCropDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        isDiseased: false,
        diseaseName: 'Unable to Diagnose',
        confidence: 0,
        severity: 'N/A',
        detectionExplanation: 'The AI model could not provide a diagnosis. The image may be unclear or the model response was invalid.',
        remedies: ['Please try a clearer image or consult a local expert.'],
      };
    }
    return output;
  }
);
