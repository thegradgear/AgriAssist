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
  description: z.string().describe('A brief description of the pest or weed, including its appearance and typical impact on crops.'),
  managementSuggestion: z.string().describe('Suggested organic and/or chemical methods for managing or removing the pest or weed. Provide helpful tips if not harmful.'),
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
1.  Determine the 'identificationType': Is it a 'PEST' (harmful insect, mite, slug etc.), a 'WEED' (unwanted plant), 'OTHER' (like a beneficial insect e.g. ladybug, or non-plant/pest), or 'UNKNOWN' if you cannot be certain.
2.  Provide the 'commonName' of the identified entity. If it's a beneficial insect, name it. If you cannot identify it, the name should be "Unable to Identify".
3.  Provide the 'scientificName' if you know it.
4.  Set 'isHarmful' to true if it is a common agricultural pest or a competitive weed. Set it to false for beneficial organisms or if it's harmless.
5.  Write a 'description' of the entity, its key visual features, and why it is or isn't harmful.
6.  Provide a 'managementSuggestion'. If it's harmful, suggest common organic and chemical control methods. If it is not harmful, provide a brief, helpful tip (e.g., "Ladybugs are beneficial as they eat aphids.").

If the image quality is too poor or the subject is not clear, set type to 'UNKNOWN' and name to 'Unable to Identify'.`,
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
      // Fallback in case the model returns nothing.
      return {
        identificationType: 'UNKNOWN',
        commonName: 'Unable to Identify',
        isHarmful: false,
        description: 'The AI model could not provide an identification for the uploaded image.',
        managementSuggestion: 'Please try a clearer image or consult a local expert.',
      };
    }
    return output;
  }
);
