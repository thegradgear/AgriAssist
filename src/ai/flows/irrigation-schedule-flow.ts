'use server';
/**
 * @fileOverview Generates an optimal irrigation schedule.
 *
 * - generateIrrigationSchedule - Creates a 7-day watering plan.
 * - IrrigationScheduleInput - The input type for the function.
 * - IrrigationScheduleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const IrrigationScheduleInputSchema = z.object({
  cropType: z.string().describe('The type of crop being cultivated (e.g., "Tomato", "Wheat").'),
  soilType: z.enum(["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky"]).describe('The primary soil type of the field.'),
  stageOfGrowth: z.enum(['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturation']).describe('The current growth stage of the crop.'),
  location: z.string().describe('The geographical location (e.g., "Pune, Maharashtra") to provide climate context.'),
  forecast: z.array(z.object({
      day: z.string().describe('The day of the week (e.g., Monday).'),
      maxTempC: z.number().describe('The forecasted maximum temperature in Celsius.'),
      rainfallMM: z.number().describe('The forecasted rainfall in millimeters.'),
  })).min(1).describe('A weather forecast for the upcoming days.'),
});
export type IrrigationScheduleInput = z.infer<typeof IrrigationScheduleInputSchema>;


const DailyRecommendationSchema = z.object({
  day: z.string().describe('The specific day for this recommendation (e.g., "Monday").'),
  shouldWater: z.boolean().describe('A simple true/false indicating if watering is recommended.'),
  waterAmountMM: z.number().optional().describe('The suggested amount of water in millimeters (mm), if watering is needed.'),
  reasoning: z.string().describe('A brief explanation for the recommendation, considering the weather, soil, and crop stage.'),
});

export const IrrigationScheduleOutputSchema = z.object({
  weeklySchedule: z.array(DailyRecommendationSchema).describe('A list of daily irrigation recommendations for the week.'),
  generalAdvice: z.string().describe('Overall advice for the week, such as tips on checking soil moisture or adjusting for unexpected weather.'),
});
export type IrrigationScheduleOutput = z.infer<typeof IrrigationScheduleOutputSchema>;


export async function generateIrrigationSchedule(input: IrrigationScheduleInput): Promise<IrrigationScheduleOutput> {
  return irrigationScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'irrigationSchedulePrompt',
  input: {schema: IrrigationScheduleInputSchema},
  output: {schema: IrrigationScheduleOutputSchema},
  prompt: `You are an expert agricultural hydrologist specializing in water management for farms in India.
A farmer needs a 7-day irrigation schedule. Analyze the provided data to give daily watering recommendations.

FARM DATA:
- Crop Type: {{{cropType}}}
- Soil Type: {{{soilType}}}
- Current Growth Stage: {{{stageOfGrowth}}}
- Location: {{{location}}}

7-DAY WEATHER FORECAST:
{{#each forecast}}
- Day: {{{day}}}, Max Temp: {{{maxTempC}}}°C, Rainfall: {{{rainfallMM}}}mm
{{/each}}

INSTRUCTIONS:
1.  **Analyze Daily Needs**: For each day in the forecast, decide if watering is needed ('shouldWater'). Consider:
    *   **Crop Water Needs**: Water requirements change with the 'stageOfGrowth'. Flowering and fruiting stages are critical and need more water. Seedlings need frequent, light watering.
    *   **Soil Type**: Sandy soils drain fast and need more frequent watering. Clay soils hold water longer and need less frequent, deeper watering. Loamy is balanced.
    *   **Weather**: High temperatures ('maxTempC') increase evaporation and water needs. Significant rainfall ('rainfallMM' > 5mm) may mean no irrigation is needed.
2.  **Determine Water Amount**: If watering is needed, suggest a 'waterAmountMM'. This is a guideline. For example, 15-25mm is a deep watering.
3.  **Provide Reasoning**: For each day, give a concise 'reasoning'. Example: "High temperature and no rain forecasted, and the crop is in the critical flowering stage." or "Sufficient rainfall expected, no irrigation needed."
4.  **Generate Weekly Schedule**: Compile the recommendations for all days into the 'weeklySchedule' array.
5.  **Give General Advice**: Provide 1-2 sentences of 'generalAdvice'. This should include tips like "Always check the top 2-3 inches of soil for dryness before watering, regardless of the schedule." or "Sandy soil requires you to monitor moisture levels more frequently."

Your goal is to help the farmer conserve water while ensuring the crop is not stressed. Be practical and clear.`,
});

const irrigationScheduleFlow = ai.defineFlow(
  {
    name: 'irrigationScheduleFlow',
    inputSchema: IrrigationScheduleInputSchema,
    outputSchema: IrrigationScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return a valid irrigation schedule.');
    }
    return output;
  }
);
