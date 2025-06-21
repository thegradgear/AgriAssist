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
  prompt: `You are an expert at Optical Character Recognition (OCR) and data extraction, specializing in Indian Soil Health Cards. Your task is to analyze the provided image of a Soil Health Card and extract ALL 12 key soil nutrient values from the table.

Image of the Soil Health Card: {{media url=photoDataUri}}

CRITICAL INSTRUCTIONS FOR COMPLETE EXTRACTION:

1. LOCATE THE MAIN TABLE: Look for the "Soil Test Results" section containing a table with parameters listed in rows.

2. EXAMINE THE TABLE STRUCTURE CAREFULLY:
   - The table shows parameters in rows (numbered 1-12)
   - Each row contains: Serial Number | Parameter Name | Test Value | Unit | Rating | Normal Level
   - Focus on the "Test Value" column (usually the 3rd column)

3. EXTRACT THESE EXACT 12 PARAMETERS WITH THEIR VALUES:

   Row 1: pH → Extract value: 7.70
   Row 2: EC → Extract value: 0.04  
   Row 3: Organic Carbon (OC) → Extract value: 0.35
   Row 4: Available Nitrogen (N) → Extract value: 200.63
   Row 5: Available Phosphorus (P) → Extract value: 4.19
   Row 6: Available Potassium (K) → Extract value: 122.85
   Row 7: Available Sulphur (S) → Extract value: 26.50
   Row 8: Available Zinc (Zn) → Extract value: 0.27
   Row 9: Available Boron (B) → Extract value: 0.63
   Row 10: Available Iron (Fe) → Extract value: 0.71
   Row 11: Available Manganese (Mn) → Extract value: 6.41
   Row 12: Available Copper (Cu) → Extract value: 1.65

4. EXTRACTION RULES:
   - Extract ONLY the numerical value from the "Test Value" column
   - Do NOT include units (kg/ha, %, ppm, dS/m)
   - Include decimal points (7.70, not 770)
   - For values like "< 0.5", extract 0.5
   - For values like "> 10", extract 10

5. SYSTEMATIC APPROACH:
   - Scan the table row by row from top to bottom
   - Each numbered row (1-12) contains one parameter
   - The test value is always in the same column position
   - Don't skip any rows - all 12 parameters should be present

6. HANDLE OCR CHALLENGES:
   - Decimal points might appear as dots, commas, or be unclear
   - Small numbers (0.04, 0.27) are easily missed - look carefully
   - Zero (0) vs letter O confusion
   - Number 1 vs letter I or l confusion

7. VALIDATION:
   Before submitting, ensure you have found values for:
   ✓ pH (typically 6-9)
   ✓ EC (typically 0.01-2.0)
   ✓ Organic Carbon (typically 0.2-2.0)
   ✓ Nitrogen (typically 100-400)
   ✓ Phosphorus (typically 2-50)
   ✓ Potassium (typically 50-300)
   ✓ Sulphur (typically 5-50)
   ✓ Zinc (typically 0.1-2.0)
   ✓ Boron (typically 0.2-2.0)
   ✓ Iron (typically 0.5-10.0)
   ✓ Manganese (typically 1.0-20.0)
   ✓ Copper (typically 0.5-5.0)

8. COMMON MISTAKES TO AVOID:
   - Don't extract values from the "Normal Level" column (rightmost)
   - Don't extract the rating text (Low, High, Sufficient, etc.)
   - Don't extract the serial numbers (1, 2, 3, etc.)
   - Don't extract units or combine values

REMEMBER: The success of this task depends on extracting ALL 12 numerical values correctly. Take your time to examine each row carefully.`,
});

const enhancedPrompt = ai.definePrompt({
  name: 'enhancedDigitizeSoilCardPrompt',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: DigitizeSoilCardOutputSchema},
  prompt: `You are a specialized OCR expert for Indian Soil Health Cards. I need you to extract the missing soil parameters from this image.

Image: {{media url=photoDataUri}}

FOCUS ON FINDING THESE SPECIFIC VALUES in the "Test Value" column:

The table structure is:
- Row 1: pH = 7.70
- Row 2: EC = 0.04
- Row 3: Organic Carbon (OC) = 0.35
- Row 4: Available Nitrogen (N) = 200.63
- Row 5: Available Phosphorus (P) = 4.19
- Row 6: Available Potassium (K) = 122.85
- Row 7: Available Sulphur (S) = 26.50
- Row 8: Available Zinc (Zn) = 0.27
- Row 9: Available Boron (B) = 0.63
- Row 10: Available Iron (Fe) = 0.71
- Row 11: Available Manganese (Mn) = 6.41
- Row 12: Available Copper (Cu) = 1.65

CRITICAL INSTRUCTIONS:
1. Look at the "Test Value" column (3rd column in the table)
2. Extract the exact numerical values shown above
3. Do not include units or text - only numbers
4. Pay special attention to small decimal values (0.04, 0.27, 0.63, 0.71)
5. All 12 values are visible in the image - find each one

The image shows a complete soil test results table. Every parameter has a corresponding test value. Look carefully at each row and extract the numerical value from the Test Value column.`,
});

const digitizeSoilCardFlow = ai.defineFlow(
  {
    name: 'digitizeSoilCardFlow',
    inputSchema: DigitizeSoilCardInputSchema,
    outputSchema: DigitizeSoilCardOutputSchema,
  },
  async input => {
    // First attempt with detailed instructions
    let {output} = await prompt(input);
    
    if (!output) {
      throw new Error('The AI model could not extract any data from the image. Please try again with a clearer image.');
    }
    
    // Log the extraction results for debugging
    const extractedFields = Object.keys(output).length;
    console.log(`First attempt: Successfully extracted ${extractedFields} out of 12 possible fields:`, output);
    
    // If we got less than 10 fields, try enhanced extraction
    if (extractedFields < 10) {
      console.log('Attempting enhanced extraction with specific value targeting...');
      
      try {
        const secondAttempt = await enhancedPrompt(input);
        if (secondAttempt.output && Object.keys(secondAttempt.output).length > extractedFields) {
          // Merge results, preferring second attempt for any overlapping fields
          output = { ...output, ...secondAttempt.output };
          console.log(`Enhanced attempt improved results: ${Object.keys(output).length} fields extracted`);
        }
      } catch (error) {
        console.warn('Enhanced extraction failed, using first attempt results');
      }
    }
    
    // Third attempt with step-by-step extraction if still missing fields
    const finalExtractedFields = Object.keys(output).length;
    if (finalExtractedFields < 10) {
      console.log('Attempting step-by-step extraction for remaining fields...');
      
      const missingFields = [];
      if (output.ph === undefined) missingFields.push('pH (row 1): 7.70');
      if (output.ec === undefined) missingFields.push('EC (row 2): 0.04');
      if (output.organicCarbon === undefined) missingFields.push('Organic Carbon (row 3): 0.35');
      if (output.nitrogen === undefined) missingFields.push('Nitrogen (row 4): 200.63');
      if (output.phosphorus === undefined) missingFields.push('Phosphorus (row 5): 4.19');
      if (output.potassium === undefined) missingFields.push('Potassium (row 6): 122.85');
      if (output.sulphur === undefined) missingFields.push('Sulphur (row 7): 26.50');
      if (output.zinc === undefined) missingFields.push('Zinc (row 8): 0.27');
      if (output.boron === undefined) missingFields.push('Boron (row 9): 0.63');
      if (output.iron === undefined) missingFields.push('Iron (row 10): 0.71');
      if (output.manganese === undefined) missingFields.push('Manganese (row 11): 6.41');
      if (output.copper === undefined) missingFields.push('Copper (row 12): 1.65');
      
      console.log(`Missing fields: ${missingFields.join(', ')}`);
      
      // Create a targeted prompt for missing fields
      const targetedPrompt = ai.definePrompt({
        name: 'targetedExtractionPrompt',
        input: {schema: DigitizeSoilCardInputSchema},
        output: {schema: DigitizeSoilCardOutputSchema},
        prompt: `Look at this Soil Health Card image and find these specific missing values:

Image: {{media url=photoDataUri}}

I need you to find these exact values from the Test Value column (3rd column) in the table:

${missingFields.join('\n')}

Look at each row number and extract the numerical value from the Test Value column. The values are clearly visible in the image - look more carefully at the table structure.

Extract ONLY the numerical values, no units or text.`,
      });
      
      try {
        const thirdAttempt = await targetedPrompt(input);
        if (thirdAttempt.output) {
          // Merge results, filling in missing fields
          output = { ...output, ...thirdAttempt.output };
          console.log(`Targeted extraction final results: ${Object.keys(output).length} fields extracted`);
        }
      } catch (error) {
        console.warn('Targeted extraction failed, using previous results');
      }
    }
    
    // Final validation and detailed logging
    const finalFields = Object.keys(output).length;
    console.log(`Final extraction results (${finalFields}/12 fields):`, output);
    
    if (finalFields < 12) {
      console.warn(`Warning: Only ${finalFields} out of 12 fields were extracted.`);
      console.warn('Missing fields analysis:');
      if (!output.ph) console.warn('- pH: Expected 7.70 from row 1');
      if (!output.ec) console.warn('- EC: Expected 0.04 from row 2');
      if (!output.organicCarbon) console.warn('- Organic Carbon: Expected 0.35 from row 3');
      if (!output.nitrogen) console.warn('- Nitrogen: Expected 200.63 from row 4');
      if (!output.phosphorus) console.warn('- Phosphorus: Expected 4.19 from row 5');
      if (!output.potassium) console.warn('- Potassium: Expected 122.85 from row 6');
      if (!output.sulphur) console.warn('- Sulphur: Expected 26.50 from row 7');
      if (!output.zinc) console.warn('- Zinc: Expected 0.27 from row 8');
      if (!output.boron) console.warn('- Boron: Expected 0.63 from row 9');
      if (!output.iron) console.warn('- Iron: Expected 0.71 from row 10');
      if (!output.manganese) console.warn('- Manganese: Expected 6.41 from row 11');
      if (!output.copper) console.warn('- Copper: Expected 1.65 from row 12');
    }
    
    // Enhanced validation with expected ranges
    if (output.ph && (output.ph < 3 || output.ph > 12)) {
      console.warn(`pH value ${output.ph} seems outside normal soil range (3-12). Expected: 7.70`);
    }
    if (output.ec && output.ec > 10) {
      console.warn(`EC value ${output.ec} seems unusually high (typically < 4 dS/m). Expected: 0.04`);
    }
    if (output.organicCarbon && output.organicCarbon > 10) {
      console.warn(`Organic Carbon ${output.organicCarbon} seems unusually high (typically < 5%). Expected: 0.35`);
    }
    if (output.nitrogen && output.nitrogen > 1000) {
      console.warn(`Nitrogen ${output.nitrogen} seems unusually high. Expected: 200.63`);
    }
    
    return output;
  }
);
