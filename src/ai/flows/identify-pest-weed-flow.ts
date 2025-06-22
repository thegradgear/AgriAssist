
'use server';
/**
 * @fileOverview An AI agent for identifying pests and weeds from images.
 *
 * - identifyPestWeed - A function that handles the pest or weed identification process.
 * - IdentifyPestWeedInput - The input type for the identifyPestWeed function.
 * - IdentifyPestWeedOutput - The return type for the identifyPestWeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyPestWeedInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a pest or weed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  contextNotes: z.string().optional().describe('Optional notes about where the pest/weed was found (e.g., "On tomato leaves", "Growing near corn stalks").'),
});
export type IdentifyPestWeedInput = z.infer<typeof IdentifyPestWeedInputSchema>;

const IdentifyPestWeedOutputSchema = z.object({
  identificationType: z.enum(['PEST', 'WEED', 'OTHER', 'UNKNOWN']).describe('The type of identification made: PEST, WEED, OTHER (if it\'s something else like a beneficial insect), or UNKNOWN if unable to identify.'),
  commonName: z.string().describe('The common name of the identified pest or weed (e.g., "Aphid", "Dandelion"). If unknown, state "Unable to Identify".'),
  scientificName: z.string().optional().describe('The scientific (Latin) name of the pest or weed. Optional.'),
  isHarmful: z.boolean().describe('Whether the identified entity is generally considered harmful to common crops.'),
  detectionExplanation: z.string().describe('A step-by-step explanation of the key visual factors that led to the identification.'),
  managementSolutions: z.array(z.string()).describe('A list of actionable management solutions or control measures. If not harmful, provide helpful tips.'),
});
export type IdentifyPestWeedOutput = z.infer<typeof IdentifyPestWeedOutputSchema>;

export async function identifyPestWeed(input: IdentifyPestWeedInput): Promise<IdentifyPestWeedOutput> {
  return identifyPestWeedFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyPestWeedPrompt',
  input: {schema: IdentifyPestWeedInputSchema},
  output: {schema: IdentifyPestWeedOutputSchema},
  prompt: `You are an expert entomologist and botanist specializing in identifying agricultural pests and weeds from images.

You will analyze the provided image and optional context notes to identify the subject.
Image: {{media url=photoDataUri}}
{{#if contextNotes}}
Context Notes: {{{contextNotes}}}
{{/if}}

Based on the image and notes, perform the following:
1.  **identificationType**: Is it a 'PEST', 'WEED', 'OTHER' (e.g. beneficial insect), or 'UNKNOWN'.
2.  **commonName**: Provide the common name. If unknown, state "Unable to Identify".
3.  **scientificName**: Provide the scientific name if known.
4.  **isHarmful**: Set to true if it is a common pest or weed.
5.  **detectionExplanation**: Provide a detailed, step-by-step explanation of the key visual factors for identification. For a pest, describe its body shape, color, and size. For a weed, describe its leaf shape, flower, and stem. Each step must be on a new line, separated by a newline character.
6.  **managementSolutions**: Provide a list of actionable management solutions. Be specific (e.g., "Manual Removal: Hand-pull weeds before they set seed." or "Biological Control: Introduce ladybugs to control aphid populations."). If it's not harmful, provide helpful facts as the solutions.

If the image quality is too poor, set type to 'UNKNOWN' and name to 'Unable to Identify' and explain why in 'detectionExplanation'.
`,
});

const identifyPestWeedFlow = ai.defineFlow(
  {
    name: 'identifyPestWeedFlow',
    inputSchema: IdentifyPestWeedInputSchema,
    outputSchema: IdentifyPestWeedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        identificationType: 'UNKNOWN',
        commonName: 'Unable to Identify',
        isHarmful: false,
        detectionExplanation: 'The AI model could not provide an identification. The image may be unclear or the model response was invalid.',
        managementSolutions: ['Please try a clearer image or consult a local expert.'],
      };
    }
    return output;
  }
);
