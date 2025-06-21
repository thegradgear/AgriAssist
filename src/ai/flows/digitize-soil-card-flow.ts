
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
  nitrogen: z.number().optional().describe('The numerical test value for "Available Nitrogen(N)", typically in kg/ha. Extract only the number.'),
  phosphorus: z.number().optional().describe('The numerical test value for "Available Phosphorus(P)", typically in kg/ha. Extract only the number.'),
  potassium: z.number().optional().describe('The numerical test value for "Available Potassium(K)", typically in kg/ha. Extract only the number.'),
  ph: z.number().optional().describe('The numerical test value for "pH". Extract only the number.'),
  ec: z.number().optional().describe('The numerical test value for "Electrical Conductivity (EC)", typically in dS/m. Extract only the number.'),
  organicCarbon: z.number().optional().describe('The numerical test value for "Organic Carbon (OC)", usually a percentage. Extract only the number.'),
  sulphur: z.number().optional().describe('The numerical test value for "Available Sulphur (S)", typically in mg/kg or ppm. Extract only the number.'),
  zinc: z.number().optional().describe('The numerical test value for "Available Zinc (Zn)", typically in mg/kg or ppm. Extract only the number.'),
  boron: z.number().optional().describe('The numerical test value for "Available Boron (B)", typically in mg/kg or ppm. Extract only the number.'),
  iron: z.number().optional().describe('The numerical test value for "Available Iron (Fe)", typically in mg/kg or ppm. Extract only the number.'),
  manganese: z.number().optional().describe('The numerical test value for "Available Manganese (Mn)", typically in mg/kg or ppm. Extract only the number.'),
  copper: z.number().optional().describe('The numerical test value for "Available Copper (Cu)", typically in mg/kg or ppm. Extract only the number.'),
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
1.  Carefully examine the image to find the values for all the soil parameters listed below.
2.  Extract **only the numerical value** for each parameter. Do not include units (like "kg/ha", "%", "mg/kg") or any other text in the final output fields.
3.  The parameters might be labeled with full names (e.g., "Available Nitrogen (N)") or abbreviations (e.g., "N", "OC").
4.  If a value for a specific parameter cannot be clearly identified or is not present on the card, you MUST omit that field from the output object. Do not guess or provide a default value.

Find the following values:
*   **pH**
*   **Electrical Conductivity (EC)**
*   **Organic Carbon (OC)**
*   **Available Nitrogen (N)**
*   **Available Phosphorus (P)**
*   **Available Potassium (K)**
*   **Available Sulphur (S)**
*   **Available Zinc (Zn)**
*   **Available Boron (B)**
*   **Available Iron (Fe)**
*   **Available Manganese (Mn)**
*   **Available Copper (Cu)**

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
