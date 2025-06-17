// 'use server'
'use server';

/**
 * @fileOverview Recommends crops based on soil conditions and weather data.
 *
 * - recommendCrops - A function that recommends crops based on soil conditions and weather data.
 * - CropRecommendationInput - The input type for the recommendCrops function.
 * - CropRecommendationOutput - The return type for the recommendCrops function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationInputSchema = z.object({
  nitrogen: z.number().describe('Nitrogen content in the soil.'),
  phosphorus: z.number().describe('Phosphorus content in the soil.'),
  potassium: z.number().describe('Potassium content in the soil.'),
  temperature: z.number().describe('Average temperature in Celsius.'),
  humidity: z.number().describe('Average humidity in percentage.'),
  ph: z.number().describe('pH level of the soil.'),
  rainfall: z.number().describe('Average rainfall in mm.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommendedCrops: z
    .string()
    .describe('A comma-separated list of recommended crops based on the input parameters.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the crop recommendations, including soil and climate suitability.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function recommendCrops(input: CropRecommendationInput): Promise<CropRecommendationOutput> {
  return recommendCropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  prompt: `You are an expert agricultural advisor. A farmer will provide you with soil conditions and weather data, and you will recommend the best crops to plant.

Soil Conditions:
Nitrogen: {{nitrogen}}
Phosphorus: {{phosphorus}}
Potassium: {{potassium}}

Weather Data:
Temperature: {{temperature}} Celsius
Humidity: {{humidity}}%
pH: {{ph}}
Rainfall: {{rainfall}} mm

Based on this information, recommend suitable crops and explain your reasoning.

Output the recommended crops as a comma separated list.
`,
});

const recommendCropsFlow = ai.defineFlow(
  {
    name: 'recommendCropsFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
