
'use server';
/**
 * @fileOverview An AI flow to digitize Indian Soil Health Cards.
 *
 * - digitizeSoilCard - A function that extracts nutrient values from an image of a Soil Health Card.
 * - DigitizeSoilCardInput - The input type for the digitizeSoilCard function.
 * - DigitizeSoilCardOutput - The return type for the digitizeSoilCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitizeSoilCardInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a Soil Health Card, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DigitizeSoilCardInput = z.infer<typeof DigitizeSoilCardInputSchema>;

// All fields are optional as the model may not be able to find them in every card.
const DigitizeSoilCardOutputSchema = z.object({
  nitrogen: z.number().optional().describe('The numerical test value for "Available Nitrogen (N)", typically in kg/ha. Extract only the number.'),
  phosphorus: z.number().optional().describe('The numerical test value for "Available Phosphorus (P)", typically in kg/ha. Extract only the number.'),
  potassium: z.number().optional().describe('The numerical test value for "Available Potassium (K)", typically in kg/ha. Extract only the number.'),
  ph: z.number().optional().describe('The numerical test value for "pH". Extract only the number.'),
  organicCarbon: z.number().optional().describe('The numerical test value for "Organic Carbon (OC)", usually a percentage. Extract only the number.'),
});
export type DigitizeSoilCardOutput = z.infer<typeof DigitizeSoilCardOutputSchema>;

export async function digitizeSoilCard(input: DigitizeSoilCardInput): Promise<DigitizeSoilCardOutput> {
  return digitizeSoilCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitizeSoilCardPrompt',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: DigitizeSoilCardOutputSchema},
  prompt: `You are an expert at Optical Character Recognition (OCR) and data extraction, specializing in Indian Soil Health Cards. Your task is to analyze the provided image of a Soil Health Card and extract key soil nutrient values. The card often contains a table with columns like "Parameter", "Test Value", and "Unit".

Image of the Soil Health Card: {{media url=photoDataUri}}

Instructions:
1.  Carefully examine the image, paying close attention to any tables listing soil test results.
2.  For each parameter below, find its row in the table and extract the corresponding 'Test Value'.
3.  Extract **only the numerical value** for each parameter. Do not include units (like "kg/ha" or "%") or any other text in the final output fields.
4.  If a value for a specific parameter cannot be clearly identified or is not present on the card, you MUST omit that field from the output object. Do not guess or provide a default value.

Parameters to find:
*   **pH**: The soil pH level. Find the row for "pH" and get its test value.
*   **Organic Carbon (OC)**: Find the row for "Organic Carbon" or "OC" and get its test value. This is often a percentage.
*   **Available Nitrogen (N)**: Find the row for "Available Nitrogen" or "N" and get its test value. This is typically in kg/ha.
*   **Available Phosphorus (P)**: Find the row for "Available Phosphorus" or "P" and get its test value. This is typically in kg/ha.
*   **Available Potassium (K)**: Find the row for "Available Potassium" or "K" and get its test value. This is typically in kg/ha.

The output must be a valid JSON object matching the provided schema.
`,
});


const digitizeSoilCardFlow = ai.defineFlow(
  {
    name: 'digitizeSoilCardFlow',
    inputSchema: DigitizeSoilCardInputSchema,
    outputSchema: DigitizeSoilCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model could not extract any data from the image. Please try again with a clearer image.');
    }
    return output;
  }
);
