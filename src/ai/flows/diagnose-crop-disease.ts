
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
  description: z.string().describe('A general description of the visual symptoms observed or reasons for the diagnosis (e.g., "Yellow spots on leaves", "Plant appears vigorous and free of pests").'),
  remedySuggestion: z.string().describe('Suggested organic or chemical remedies if a disease is found, or general care tips if the plant appears healthy.'),
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
1. Determine if the plant appears to be diseased. Set 'isDiseased' to true or false.
2. If diseased, identify the most likely disease and set 'diseaseName' to its common name. Provide a 'confidence' score (0.0 to 1.0) for this diagnosis.
3. If the plant appears healthy, set 'diseaseName' to "Appears Healthy" and 'confidence' can be 1.0.
4. Provide a 'description' of the key visual symptoms observed (e.g., "Wilting leaves with brown spots", "No visible signs of stress or infection") that led to your conclusion.
5. If a disease is identified, suggest a common 'remedySuggestion' (can be organic or chemical, mention if multiple options exist). If healthy, provide a brief, general care tip as the 'remedySuggestion'.

Prioritize common diseases. If the image quality is too poor for a diagnosis, or if it's not a plant, indicate this in the description and set 'isDiseased' to false, 'diseaseName' to "Unable to Diagnose".
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
      // Fallback in case the model returns nothing, though Zod schema should enforce structure.
      return {
        isDiseased: false,
        diseaseName: 'Unable to Diagnose',
        confidence: 0,
        description: 'The AI model could not provide a diagnosis for the uploaded image.',
        remedySuggestion: 'Please try a clearer image or consult a local expert.',
      };
    }
    return output;
  }
);

