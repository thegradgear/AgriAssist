
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
  nitrogen: z.number().describe('Nitrogen content in the soil (kg/ha).'),
  phosphorus: z.number().describe('Phosphorus content in the soil (kg/ha).'),
  potassium: z.number().describe('Potassium content in the soil (kg/ha).'),
  ph: z.number().describe('pH level of the soil.'),
  ec: z.number().describe('Electrical conductivity of the soil (dS/m).'),
  organicCarbon: z.number().describe('Organic Carbon content in the soil (%).'),
  sulphur: z.number().describe('Sulphur content in the soil (mg/kg).'),
  zinc: z.number().describe('Zinc content in the soil (mg/kg).'),
  boron: z.number().describe('Boron content in the soil (mg/kg).'),
  iron: z.number().describe('Iron content in the soil (mg/kg).'),
  manganese: z.number().describe('Manganese content in the soil (mg/kg).'),
  copper: z.number().describe('Copper content in the soil (mg/kg).'),
  temperature: z.number().describe('Average temperature in Celsius.'),
  humidity: z.number().describe('Average humidity in percentage.'),
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
  prompt: `You are an expert agricultural advisor. A farmer will provide you with comprehensive soil conditions and weather data. You will recommend the best crops to plant.

Soil Conditions:
- pH: {{ph}}
- Electrical Conductivity (EC): {{ec}} dS/m
- Organic Carbon (OC): {{organicCarbon}} %
- Available Nitrogen (N): {{nitrogen}} kg/ha
- Available Phosphorus (P): {{phosphorus}} kg/ha
- Available Potassium (K): {{potassium}} kg/ha
- Available Sulphur (S): {{sulphur}} mg/kg
- Available Zinc (Zn): {{zinc}} mg/kg
- Available Boron (B): {{boron}} mg/kg
- Available Iron (Fe): {{iron}} mg/kg
- Available Manganese (Mn): {{manganese}} mg/kg
- Available Copper (Cu): {{copper}} mg/kg

Weather Data:
- Temperature: {{temperature}} Celsius
- Humidity: {{humidity}}%
- Rainfall: {{rainfall}} mm

Based on this detailed information, recommend suitable crops and explain your reasoning, considering all macro and micro-nutrients.

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
