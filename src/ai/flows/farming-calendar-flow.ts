'use server';
/**
 * @fileOverview Generates a personalized farming calendar.
 *
 * - generateFarmingCalendar - A function that creates a farming schedule.
 * - FarmingCalendarInput - The input type for the generateFarmingCalendar function.
 * - FarmingCalendarOutput - The return type for the generateFarmingCalendar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmingCalendarInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., Tomato, Wheat, Rice).'),
  location: z.string().describe('The general farming location (e.g., "Nashik, Maharashtra", "Punjab"). This helps in considering regional conditions if known.'),
  plantingDate: z.string().describe('The approximate planned planting date in YYYY-MM-DD format.'),
  soilType: z.enum(["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky", "Not Sure"]).optional().describe('The type of soil, if known (e.g., Loamy, Sandy). Optional.'),
  farmingPractice: z.enum(["Conventional", "Organic", "Integrated Pest Management (IPM)", "Other"]).optional().describe('Specific farming practices being followed (e.g., Organic, Conventional). Optional.'),
});
export type FarmingCalendarInput = z.infer<typeof FarmingCalendarInputSchema>;

const CalendarEventSchema = z.object({
  eventName: z.string().describe('Name of the farming activity (e.g., "Soil Preparation", "Planting", "First Fertilization", "Weed Control", "Harvesting Starts").'),
  startDate: z.string().describe('Suggested start date for the activity (YYYY-MM-DD format).'),
  endDate: z.string().optional().describe('Suggested end date for the activity if it spans a period (YYYY-MM-DD format). Optional.'),
  description: z.string().describe('Brief description or notes for the activity (e.g., "Apply NPK fertilizer as per soil test recommendations", "Monitor for early signs of blight").'),
  category: z.enum(['Preparation', 'Planting', 'Fertilization', 'Irrigation', 'Pest & Disease Management', 'Weed Control', 'Harvesting', 'Post-Harvest', 'Other']).describe('Category of the farming activity.'),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

const FarmingCalendarOutputSchema = z.object({
  cropName: z.string().describe('The crop for which the calendar is generated.'),
  location: z.string().describe('The location considered for the calendar.'),
  plantingDate: z.string().describe('The provided planting date.'),
  schedule: z.array(CalendarEventSchema).describe('A list of scheduled farming activities with dates and descriptions.'),
  generalAdvice: z.string().optional().describe('Any general advice or important considerations for the crop season based on the inputs. Optional.'),
});
export type FarmingCalendarOutput = z.infer<typeof FarmingCalendarOutputSchema>;

export async function generateFarmingCalendar(input: FarmingCalendarInput): Promise<FarmingCalendarOutput> {
  return farmingCalendarFlow(input);
}

const prompt = ai.definePrompt({
  name: 'farmingCalendarPrompt',
  input: {schema: FarmingCalendarInputSchema},
  output: {schema: FarmingCalendarOutputSchema},
  prompt: `You are an expert agricultural advisor. A farmer needs a personalized farming calendar.
Generate a typical schedule of activities from soil preparation to post-harvest for the specified crop and conditions.
Base the schedule around the provided planting date. Dates should be in YYYY-MM-DD format.
If the location suggests specific regional considerations (e.g., monsoon timing in "Punjab" vs "Kerala"), try to factor them in subtly if general knowledge allows, but prioritize a standard crop cycle.
Tailor advice slightly if soil type or farming practice is mentioned (e.g., organic practices might have different fertilization or pest control timings/methods).

Farmer's Inputs:
- Crop Name: {{{cropName}}}
- Location: {{{location}}}
- Approximate Planting Date: {{{plantingDate}}}
{{#if soilType~}}
- Soil Type: {{{soilType}}}
{{/if~}}
{{#if farmingPractice~}}
- Farming Practice: {{{farmingPractice}}}
{{/if~}}

Output Instructions:
1.  Confirm the 'cropName', 'location', and 'plantingDate' in your output.
2.  Provide a 'schedule' as an array of events. Each event must include:
    *   'eventName': Clear name of the activity.
    *   'startDate': Calculated start date (YYYY-MM-DD).
    *   'endDate': Calculated end date (YYYY-MM-DD), if the activity is a window (e.g., harvest). Optional.
    *   'description': Concise, actionable advice for the activity.
    *   'category': One of 'Preparation', 'Planting', 'Fertilization', 'Irrigation', 'Pest & Disease Management', 'Weed Control', 'Harvesting', 'Post-Harvest', 'Other'.
3.  Provide 'generalAdvice' (optional) with 1-2 key reminders or tips for the season (e.g., "Ensure consistent irrigation during flowering.", "Scout for pests weekly.").

Example event categories and names:
- Preparation: "Soil Testing", "Ploughing", "Manure Application"
- Planting: "Seed Treatment", "Sowing/Transplanting"
- Fertilization: "Basal Fertilizer Application", "Top Dressing - Nitrogen"
- Irrigation: "First Irrigation", "Critical Water Stage Irrigation"
- Pest & Disease Management: "Preventative Spray", "Aphid Monitoring"
- Weed Control: "First Weeding", "Herbicide Application (if conventional)"
- Harvesting: "Maturity Check", "Harvest Window", "First Picking"
- Post-Harvest: "Drying", "Storage Preparation"

Focus on key milestones. A typical schedule might have 8-15 events.
Adjust timings based on common crop durations. For example, a short-season vegetable will have a more compressed schedule than a long-duration grain crop.
If 'Organic' farming practice is selected, ensure fertilizer/pest control suggestions are organic-compliant (e.g., "Apply compost/vermicompost", "Use neem oil for pest control").
If 'Not Sure' for soil type, or if not provided, give general advice.
`,
});

const farmingCalendarFlow = ai.defineFlow(
  {
    name: 'farmingCalendarFlow',
    inputSchema: FarmingCalendarInputSchema,
    outputSchema: FarmingCalendarOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return a valid calendar structure.');
    }
    // Ensure dates are valid, though Zod doesn't validate date strings deeply by default
    // Basic validation could be added here if needed, or rely on model for YYYY-MM-DD format.
    return output;
  }
);
