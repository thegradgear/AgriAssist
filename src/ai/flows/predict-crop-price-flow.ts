
'use server';

/**
 * @fileOverview Crop price prediction flow for farmers with MSP comparison and factor analysis.
 *
 * - predictCropPrice - Predicts crop price based on farmer inputs.
 * - PredictCropPriceInput - The input type for the predictCropPrice function.
 * - PredictCropPriceOutput - The return type for the predictCroprice function.
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

const FactorSchema = z.object({
  name: z.string().describe('The name of the factor (e.g., Seasonality, Market Demand, Quality).'),
  impact: z.enum(['Positive', 'Negative', 'Neutral']).describe('The impact of this factor on the price: Positive, Negative, or Neutral.'),
  reason: z.string().describe('A brief explanation of why this factor has the given impact.'),
});

const MspComparisonSchema = z.object({
  knownMsp: z.number().describe('The known Minimum Support Price (MSP) for the crop in the same unit as the predicted price.'),
  differencePercentage: z.number().describe('The percentage difference between the predicted price and the MSP. Positive if above MSP, negative if below.'),
  outlook: z.string().describe('A brief sentence describing the comparison (e.g., "Predicted price is significantly above MSP.").'),
});


const PredictCropPriceOutputSchema = z.object({
  predictedPrice: z.number().describe('The most likely predicted market price for the crop.'),
  priceUnit: z.string().describe('The unit for the predicted price (e.g., "INR/quintal", "INR/kg", "INR/tonne"). The AI should choose the most common unit for the crop and market.'),
  priceRangeMin: z.number().optional().describe('The lower end of the potential price range, if a range can be estimated.'),
  priceRangeMax: z.number().optional().describe('The upper end of the potential price range, if a range can be estimated.'),
  confidenceLevel: z.number().min(0).max(1).describe('The confidence level of the prediction (0.0 to 1.0), where 1.0 is very confident.'),
  factors: z.array(FactorSchema).describe('A list of key factors that influenced this price prediction, each with its name, impact, and a short reason.'),
  mspComparison: MspComparisonSchema.optional().describe('Comparison with the Minimum Support Price (MSP), if applicable for the crop. Omit this field entirely if the crop does not have a well-known, published MSP.'),
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
A farmer will provide details about their crop, market, and intended sale period. Your task is to predict the market price and provide a structured analysis.

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
1.  **Predicted Price & Unit**: Provide the 'predictedPrice' and the most common 'priceUnit' for this crop in the specified Indian market (e.g., "INR/quintal", "INR/kg").
2.  **Price Range (Optional)**: If possible, estimate a 'priceRangeMin' and 'priceRangeMax'.
3.  **Confidence Level**: Assign a 'confidenceLevel' (0.0 to 1.0).
4.  **Factors**: Provide a structured list of 'factors'. For each factor, include:
    *   'name': The factor's name (e.g., Seasonality, Market Demand, Input Costs).
    *   'impact': 'Positive', 'Negative', or 'Neutral'.
    *   'reason': A concise explanation (e.g., "Harvest season may lead to higher supply, putting downward pressure on prices.").
5.  **MSP Comparison (Crucial)**: 
    *   Check if the '{{{cropName}}}' is a major crop with a well-known Minimum Support Price (MSP) announced by the Government of India (e.g., Paddy, Wheat, Jowar, Bajra, Maize, Ragi, Tur, Moong, Urad, Groundnut, Soybean, etc.).
    *   If it is, provide the 'mspComparison' object containing 'knownMsp' (in the same unit as your prediction), 'differencePercentage', and an 'outlook' sentence.
    *   If the crop has no widely published MSP, or if it's a minor crop or vegetable, **OMIT the mspComparison field completely**.
6.  **Market Outlook (Optional)**: Provide a brief 'marketOutlook' if you can discern one.

Base your prediction on typical Indian agricultural market dynamics, seasonality, inflation, government policies (like MSP), and general supply-demand for the crop.
If grade/quality is provided, factor it in. If historical data is provided, use it as a reference point but also consider broader market changes.
If essential information is critically missing, state this in one of the factor reasons and provide a very low confidence score.
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
            factors: [{
              name: 'Model Error',
              impact: 'Negative',
              reason: 'Could not generate a prediction based on the provided input. The model did not return a valid response.'
            }],
        };
    }
    return output;
  }
);
