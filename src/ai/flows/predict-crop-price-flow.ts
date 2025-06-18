
'use server';

/**
 * @fileOverview Crop price prediction flow for farmers.
 *
 * - predictCropPrice - Predicts crop price based on farmer inputs.
 * - PredictCropPriceInput - The input type for the predictCropPrice function.
 * - PredictCropPriceOutput - The return type for the predictCropPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCropPriceInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., Wheat, Rice, Tomato).'),
  marketLocation: z.string().describe('The primary market or region where the crop will be sold (e.g., "Nashik Mandi", "Uttar Pradesh", "Local Market").'),
  monthOfSale: z.enum([
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ]).describe('The anticipated month of sale.'),
  yearOfSale: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 5).describe('The anticipated year of sale.'),
  gradeOrQuality: z.string().optional().describe('The grade or quality of the crop, if known (e.g., "Grade A", "FAQ - Fair Average Quality", "Export Quality").'),
  historicalPriceData: z.string().optional().describe('Any known historical price data for this crop in the same market/season, if available (e.g., "Last year around this time it was 2000 INR/quintal", "Monsoon prices average 15 INR/kg").'),
});

export type PredictCropPriceInput = z.infer<typeof PredictCropPriceInputSchema>;

const PredictCropPriceOutputSchema = z.object({
  predictedPrice: z.number().describe('The most likely predicted market price for the crop.'),
  priceUnit: z.string().describe('The unit for the predicted price (e.g., "INR/quintal", "INR/kg", "INR/tonne"). The AI should choose the most common unit for the crop and market.'),
  priceRangeMin: z.number().optional().describe('The lower end of the potential price range, if a range can be estimated.'),
  priceRangeMax: z.number().optional().describe('The upper end of the potential price range, if a range can be estimated.'),
  confidenceLevel: z.number().min(0).max(1).describe('The confidence level of the prediction (0.0 to 1.0), where 1.0 is very confident.'),
  factorsConsidered: z.string().describe('A brief explanation of the key factors that influenced this price prediction (e.g., seasonality, market trends, historical data if provided, location).'),
  marketOutlook: z.string().optional().describe('A short general outlook for the crop in the specified market and time, if discernible (e.g., "Prices expected to be stable", "High demand anticipated").'),
});

export type PredictCropPriceOutput = z.infer<typeof PredictCropPriceOutputSchema>;

export async function predictCropPrice(input: PredictCropPriceInput): Promise<PredictCropPriceOutput> {
  return predictCropPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictCropPricePrompt',
  input: {schema: PredictCropPriceInputSchema},
  output: {schema: PredictCropPriceOutputSchema},
  prompt: `You are an expert agricultural market analyst specializing in predicting crop prices in India.
A farmer will provide details about their crop, market, and intended sale period. Your task is to predict the market price.

Farmer's Input:
- Crop Name: {{{cropName}}}
- Market Location: {{{marketLocation}}}
- Month of Sale: {{{monthOfSale}}}
- Year of Sale: {{{yearOfSale}}}
{{#if gradeOrQuality~}}
- Grade/Quality: {{{gradeOrQuality}}}
{{/if~}}
{{#if historicalPriceData~}}
- Farmer's note on historical prices: {{{historicalPriceData}}}
{{/if~}}

Instructions for your prediction:
1.  **Predicted Price & Unit**: Provide the most likely 'predictedPrice' and the most common 'priceUnit' for this crop in the specified Indian market (e.g., "INR/quintal", "INR/kg").
2.  **Price Range (Optional)**: If possible, estimate a 'priceRangeMin' and 'priceRangeMax'. If not confident enough for a range, omit these.
3.  **Confidence Level**: Assign a 'confidenceLevel' (0.0 to 1.0) for your overall prediction.
4.  **Factors Considered**: Briefly explain the 'factorsConsidered' in your prediction. Mention seasonality, general market trends for the crop, impact of location, and effect of quality/historical data if provided.
5.  **Market Outlook (Optional)**: Provide a brief 'marketOutlook' if you can discern one (e.g., "Demand looks strong", "Supply glut expected").

Base your prediction on typical Indian agricultural market dynamics, seasonality, inflation, government policies (like MSP if highly relevant and widely known for the crop), and general supply-demand for the {{{cropName}}} in {{{marketLocation}}} around {{{monthOfSale}}}, {{{yearOfSale}}}.
If grade/quality is provided, factor it in (e.g., premium grade might fetch higher prices).
If historical data is provided by the farmer, use it as a reference point but also consider broader market changes since then.
If essential information is critically missing for a reasonable prediction (e.g. crop type and market location are too vague), state this in 'factorsConsidered' and provide a very low confidence score with a generic price or no price.
`,
});

const predictCropPriceFlow = ai.defineFlow(
  {
    name: 'predictCropPriceFlow',
    inputSchema: PredictCropPriceInputSchema,
    outputSchema: PredictCropPriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        // Fallback or error handling
        return {
            predictedPrice: 0,
            priceUnit: 'N/A',
            confidenceLevel: 0,
            factorsConsidered: 'Could not generate a prediction based on the provided input. The model did not return a valid response.',
        };
    }
    return output;
  }
);
