'use server';

/**
 * @fileOverview Yield prediction flow for farmers.
 *
 * - predictYield - Predicts crop yield based on farmer inputs.
 * - YieldPredictionInput - The input type for the predictYield function.
 * - YieldPredictionOutput - The return type for the predictYield function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YieldPredictionInputSchema = z.object({
  state: z.string().describe('The state where the farm is located.'),
  district: z.string().describe('The district where the farm is located.'),
  season: z.string().describe('The season for the crop.'),
  crop: z.string().describe('The name of the crop.'),
  area: z.number().describe('The area of the field in acres.'),
});

export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number().describe('The predicted yield of the crop in kilograms.'),
  unit: z.string().describe('The unit of measurement for the predicted yield (kilograms).'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});

export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function predictYield(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
  return predictYieldFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yieldPredictionPrompt',
  input: {schema: YieldPredictionInputSchema},
  output: {schema: YieldPredictionOutputSchema},
  prompt: `You are an expert agricultural advisor for farmers in India. Based on the provided details, predict the yield for the specified crop.

State: {{{state}}}
District: {{{district}}}
Season: {{{season}}}
Crop: {{{crop}}}
Area (acres): {{{area}}}

Consider historical yield data, typical yields for the region, and any relevant factors that may influence the yield.  Provide a predicted yield in kilograms, a unit of "kilograms", and a confidence level (0 to 1) for your prediction.
`,
});

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: YieldPredictionInputSchema,
    outputSchema: YieldPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
