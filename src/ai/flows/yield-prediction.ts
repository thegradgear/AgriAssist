'use server';

/**
 * @fileOverview Yield prediction flow for farmers, including risk factors and variability.
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
  soilType: z.string().optional().describe('The type of soil in the field (e.g., Loamy, Sandy, Clay).'),
  irrigationAvailability: z.string().optional().describe('The type of irrigation available (e.g., Rain-fed, Well-irrigated).'),
});

export type YieldPredictionInput = z.infer<typeof YieldPredictionInputSchema>;

const YieldPredictionOutputSchema = z.object({
  predictedYield: z.number().describe('The most likely predicted yield of the crop in kilograms per acre.'),
  predictedYieldRangeMin: z.number().describe('The lower bound of the likely yield range in kilograms per acre.'),
  predictedYieldRangeMax: z.number().describe('The upper bound of the likely yield range in kilograms per acre.'),
  unit: z.string().describe('The unit of measurement for the predicted yield (kilograms per acre).'),
  riskFactors: z.string().describe("A qualitative note about key variables or risks that could impact the yield (e.g., 'Yields are highly dependent on monsoon timing.')."),
});

export type YieldPredictionOutput = z.infer<typeof YieldPredictionOutputSchema>;

export async function predictYield(input: YieldPredictionInput): Promise<YieldPredictionOutput> {
  return predictYieldFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yieldPredictionPrompt',
  input: {schema: YieldPredictionInputSchema},
  output: {schema: YieldPredictionOutputSchema},
  prompt: `You are an expert agricultural advisor for farmers in India. Based on the provided details, predict the yield for the specified crop in kilograms per acre.

Farmer's Inputs:
- State: {{{state}}}
- District: {{{district}}}
- Season: {{{season}}}
- Crop: {{{crop}}}
- Area (acres): {{{area}}}
{{#if soilType~}}
- Soil Type: {{{soilType}}}
{{/if~}}
{{#if irrigationAvailability~}}
- Irrigation: {{{irrigationAvailability}}}
{{/if~}}

Your Task:
1.  **Prediction**: Predict the most likely yield ('predictedYield') in kilograms per acre.
2.  **Variability Range**: Provide a realistic yield range ('predictedYieldRangeMin' and 'predictedYieldRangeMax') in kg/acre. This range should reflect potential variations due to weather, pests, etc. A typical range might be +/- 10-15% of the predicted yield.
3.  **Risk Assessment**: Provide a concise 'riskFactors' note. This should highlight the most critical variable for this crop in this region (e.g., "Yields are highly sensitive to late-season pest attacks.", "Success heavily depends on consistent irrigation during the flowering stage.").
4.  **Unit**: Set the 'unit' to "kilograms per acre".

Base your prediction on historical data for the region, considering the crop type, soil (if provided), and irrigation (if provided). The output should be per acre, not for the total area.
`,
});

const predictYieldFlow = ai.defineFlow(
  {
    name: 'predictYieldFlow',
    inputSchema: YieldPredictionInputSchema,
    outputSchema: YieldPredictionOutputSchema,
  },
  async input => {
    // The prompt now calculates per acre, so the area input is for context only.
    const {output} = await prompt(input);
    return output!;
  }
);
