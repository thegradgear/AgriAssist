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
  nitrogen: z.number().optional().describe('The extracted Nitrogen (N) value in kg/ha. The model should find this value, which might be listed under "Available Nitrogen".'),
  phosphorus: z.number().optional().describe('The extracted Phosphorus (P) value in kg/ha. The model should find this value, which might be listed under "Available Phosphorus".'),
  potassium: z.number().optional().describe('The extracted Potassium (K) value in kg/ha. The model should find this value, which might be listed under "Available Potassium".'),
  ph: z.number().optional().describe('The extracted pH value of the soil. The model should find this value, which might be listed under "pH".'),
  organicCarbon: z.number().optional().describe('The extracted Organic Carbon (OC) value, usually as a percentage. The model should find this value, which might be listed under "Organic Carbon".'),
});
export type DigitizeSoilCardOutput = z.infer<typeof DigitizeSoilCardOutputSchema>;

export async function digitizeSoilCard(input: DigitizeSoilCardInput): Promise<DigitizeSoilCardOutput> {
  return digitizeSoilCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitizeSoilCardPrompt',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: DigitizeSoilCardOutputSchema},
  prompt: `You are an expert at Optical Character Recognition (OCR) and data extraction, specializing in Indian Soil Health Cards. Your task is to analyze the provided image of a Soil Health Card and extract key soil nutrient values.

Image of the Soil Health Card: {{media url=photoDataUri}}

Instructions:
1.  Carefully examine the image to find the following parameters and their corresponding values:
    *   **pH**: The soil pH level. Look for a label like "pH", "pH(1:2.5)", or similar.
    *   **Organic Carbon (OC)**: Look for a label like "Organic Carbon" or "OC". The value is often a percentage (%). Extract only the numerical value.
    *   **Available Nitrogen (N)**: Look for "Available Nitrogen" or "N". The value is typically in kg/ha or kg/acre. Extract only the numerical value.
    *   **Available Phosphorus (P)**: Look for "Available Phosphorus" or "P". The value is typically in kg/ha or kg/acre. Extract only the numerical value.
    *   **Available Potassium (K)**: Look for "Available Potassium" or "K". The value is typically in kg/ha or kg/acre. Extract only the numerical value.
2.  Extract only the numerical values for each parameter. Do not include units (like "kg/ha" or "%") in the final output fields.
3.  If a value for a specific parameter cannot be clearly identified or is not present on the card, you MUST omit that field from the output object. Do not guess or provide a default value.
4.  The output must be a valid JSON object matching the provided schema. The model can return values for N, P, K, pH and OC.
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
