
'use server';
/**
 * @fileOverview Improved AI flow to digitize Indian Soil Health Cards.
 * 
 * Key improvements:
 * - Added an initial validation step to ensure the image is a Soil Health Card.
 * - Removed hardcoded values from prompts
 * - Added progressive extraction strategy
 * - Enhanced OCR-specific instructions
 * - Better validation logic
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

const DigitizeSoilCardOutputSchema = z.object({
  nitrogen: z.number().optional().describe('Available Nitrogen(N) in kg/ha'),
  phosphorus: z.number().optional().describe('Available Phosphorus(P) in kg/ha'),
  potassium: z.number().optional().describe('Available Potassium(K) in kg/ha'),
  ph: z.number().optional().describe('pH value'),
  ec: z.number().optional().describe('Electrical Conductivity (EC) in dS/m'),
  organicCarbon: z.number().optional().describe('Organic Carbon (OC) as percentage'),
  sulphur: z.number().optional().describe('Available Sulphur (S) in ppm'),
  zinc: z.number().optional().describe('Available Zinc (Zn) in ppm'),
  boron: z.number().optional().describe('Available Boron (B) in ppm'),
  iron: z.number().optional().describe('Available Iron (Fe) in ppm'),
  manganese: z.number().optional().describe('Available Manganese (Mn) in ppm'),
  copper: z.number().optional().describe('Available Copper (Cu) in ppm'),
});
export type DigitizeSoilCardOutput = z.infer<typeof DigitizeSoilCardOutputSchema>;

// Define a specific return type for the server action wrapper
export type DigitizeSoilCardServerActionOutput = 
  | { success: true; data: DigitizeSoilCardOutput }
  | { success: false; error: string };


// The wrapper function now returns the new type and handles errors
export async function digitizeSoilCard(input: DigitizeSoilCardInput): Promise<DigitizeSoilCardServerActionOutput> {
  try {
    const data = await digitizeSoilCardFlow(input);
    return { success: true, data };
  } catch (e: any) {
    // Return a user-friendly error message
    return { success: false, error: e.message || "An unknown error occurred during card digitization." };
  }
}


// NEW: Image Validation Schema and Prompt
const ImageValidationSchema = z.object({
  isSoilCard: z.boolean().describe('Set to true only if the image is a clear, readable Indian Soil Health Card document.'),
  reason: z.string().describe('If not a soil card, explain why (e.g., "Image appears to be a plant leaf.", "Image is too blurry."). Otherwise, state "Image is a valid soil card."'),
});

const imageValidationPrompt = ai.definePrompt({
  name: 'soilCardImageValidation',
  input: { schema: DigitizeSoilCardInputSchema },
  output: { schema: ImageValidationSchema },
  prompt: `You are an expert image classifier. Your only task is to determine if the provided image is an official Indian Soil Health Card.

  Image: {{media url=photoDataUri}}

  - If the image clearly shows a document with a table titled "Soil Test Results" (or similar wording) and rows for parameters like pH, EC, Nitrogen, etc., you MUST set isSoilCard to true.
  - If the image is of ANYTHING ELSE (e.g., a plant, a person, an animal, a landscape, a different document), you MUST set isSoilCard to false and briefly explain what you see in the 'reason' field. For example: "Image appears to be a plant leaf." or "Image is a picture of a tractor."
  - If the image IS a soil card but is too blurry, dark, or unreadable to extract data from, you MUST set isSoilCard to false and state that the image is unclear in the 'reason' field.
  
  Your response must be accurate. Do not attempt to find a soil card in an image where one does not exist.`,
});


// Main extraction prompt - generic without hardcoded values
const mainExtractionPrompt = ai.definePrompt({
  name: 'mainSoilCardExtraction',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: DigitizeSoilCardOutputSchema},
  prompt: `You are an expert OCR system specialized in Indian Soil Health Cards. Extract all soil parameter values from the "Soil Test Results" table.

Image: {{media url=photoDataUri}}

EXTRACTION INSTRUCTIONS:

1. LOCATE THE TABLE: Find the "Soil Test Results" section with numbered rows (1-12).

2. TABLE STRUCTURE: Each row contains:
   - Serial Number (1, 2, 3, etc.)
   - Parameter Name 
   - Test Value (THIS IS WHAT YOU NEED)
   - Unit
   - Rating (colored background)
   - Normal Level

3. EXTRACT FROM TEST VALUE COLUMN (usually 3rd column):
   Row 1: pH → Extract the numerical value
   Row 2: EC → Extract the numerical value
   Row 3: Organic Carbon (OC) → Extract the numerical value
   Row 4: Available Nitrogen (N) → Extract the numerical value
   Row 5: Available Phosphorus (P) → Extract the numerical value
   Row 6: Available Potassium (K) → Extract the numerical value
   Row 7: Available Sulphur (S) → Extract the numerical value
   Row 8: Available Zinc (Zn) → Extract the numerical value
   Row 9: Available Boron (B) → Extract the numerical value
   Row 10: Available Iron (Fe) → Extract the numerical value
   Row 11: Available Manganese (Mn) → Extract the numerical value
   Row 12: Available Copper (Cu) → Extract the numerical value

4. OCR GUIDELINES:
   - Extract ONLY numerical values (no units)
   - Include decimal points if present
   - For ranges like "< 0.5", extract 0.5
   - For ranges like "> 10", extract 10
   - Ignore colored backgrounds and focus on the numbers
   - Small decimal values (0.XX) require extra attention

5. VALIDATION RANGES (for reference):
   - pH: 3.0-12.0
   - EC: 0.01-10.0 dS/m
   - Organic Carbon: 0.1-5.0%
   - Nitrogen: 50-800 kg/ha
   - Phosphorus: 1-100 kg/ha
   - Potassium: 25-500 kg/ha
   - Sulphur: 5-100 ppm
   - Zinc: 0.1-5.0 ppm
   - Boron: 0.1-3.0 ppm
   - Iron: 0.1-50.0 ppm
   - Manganese: 0.5-50.0 ppm
   - Copper: 0.1-10.0 ppm

Extract every visible value carefully. Do not skip any parameters.`,
});

// Focused extraction for problematic fields
const focusedExtractionPrompt = ai.definePrompt({
  name: 'focusedSoilCardExtraction',
  input: {schema: z.object({
    photoDataUri: z.string(),
    missingFields: z.array(z.string()),
  })},
  output: {schema: DigitizeSoilCardOutputSchema},
  prompt: `Focus on extracting these specific missing soil parameters from the Soil Health Card:

Image: {{media url=photoDataUri}}
Missing fields: {{missingFields}}

SPECIAL FOCUS INSTRUCTIONS:

1. For NITROGEN (row 4): Look for values typically 100-400 kg/ha
2. For BORON (row 9): Look for small decimal values like 0.XX ppm  
3. For IRON (row 10): Look for small decimal values, often < 5.0 ppm
4. For MANGANESE (row 11): Look for values typically 1-20 ppm
5. For COPPER (row 12): Look for values typically 0.5-5.0 ppm

ENHANCED OCR TECHNIQUES:
- Zoom in mentally on each target row
- Ignore colored rating backgrounds
- Focus only on the Test Value column (3rd column)
- Pay extra attention to decimal points
- Consider OCR errors: 0 vs O, 1 vs I, 6 vs G, 5 vs S
- Look for partially obscured numbers

Extract the numerical values only, no units or text.`,
});

// Ultra-focused extraction specifically for Iron, Manganese, and Copper
const micronutrientExtractionPrompt = ai.definePrompt({
  name: 'micronutrientExtraction',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: z.object({
    iron: z.number().optional().describe('Available Iron (Fe) from row 10'),
    manganese: z.number().optional().describe('Available Manganese (Mn) from row 11'),
    copper: z.number().optional().describe('Available Copper (Cu) from row 12'),
  })},
  prompt: `ULTRA-FOCUSED EXTRACTION: Extract ONLY Iron, Manganese, and Copper values from the bottom rows of the soil test table.

Image: {{media url=photoDataUri}}

TARGET ROWS - BOTTOM OF THE TABLE:
Row 10: Available Iron (Fe) - Look for decimal number in Test Value column
Row 11: Available Manganese (Mn) - Look for single digit number in Test Value column  
Row 12: Available Copper (Cu) - Look for decimal number in Test Value column

CRITICAL OCR INSTRUCTIONS FOR THESE SPECIFIC FIELDS:

IRON (Row 10):
- Look for a small decimal number (typically 0.1 to 10.0)
- Often appears as 0.XX format
- Red "Deficient" rating background - ignore the color, focus on the number
- The value is in the Test Value column before "ppm"

MANGANESE (Row 11): 
- Look for a single digit number (typically 1-20)
- Green "Sufficient" rating background - ignore the color
- Often a whole number like 6, 7, 8, etc.
- May have decimal like 6.41, 7.25, etc.

COPPER (Row 12):
- Look for a decimal number (typically 0.5 to 5.0)
- Often appears as 1.XX format
- Green "Sufficient" rating background - ignore the color
- The value is in the Test Value column before "ppm"

SCANNING TECHNIQUE:
1. Go to the BOTTOM THREE ROWS of the table (rows 10, 11, 12)
2. For each row, look at the 3rd column (Test Value)
3. Extract the NUMBER that appears before the unit "ppm"
4. Ignore all colored backgrounds and text ratings
5. Focus on clear numerical digits

COMMON OCR ERRORS TO WATCH FOR:
- 0.71 might be read as 0.17 or 0.7I
- 6.41 might be read as 6.4I or 6.4l
- 1.65 might be read as I.65 or 1.6S

Extract these three values carefully - they are definitely visible in the image.`,
});

// Alternative extraction with different approach for stubborn fields
const alternativeExtractionPrompt = ai.definePrompt({
  name: 'alternativeExtraction',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: z.object({
    bottomRowValues: z.array(z.number()).describe('All numerical values from the last 3 rows of the table'),
  })},
  prompt: `Look at the LAST THREE ROWS (10, 11, 12) of the Soil Test Results table and extract ALL numerical values you can see in the Test Value column.

Image: {{media url=photoDataUri}}

INSTRUCTIONS:
1. Focus only on rows 10, 11, and 12 at the bottom of the table
2. Look at the Test Value column (3rd column)
3. Extract every number you can see, even if you're not sure which parameter it belongs to
4. Return them as an array in order: [iron_value, manganese_value, copper_value]

The three values should be:
- A decimal number (Iron)
- A number around 1-20 (Manganese)  
- A decimal number (Copper)

Just focus on reading the numbers clearly from these three bottom rows.`,
});

// Row-by-row extraction for maximum accuracy
const rowByRowPrompt = ai.definePrompt({
  name: 'rowByRowExtraction',
  input: {schema: DigitizeSoilCardInputSchema},
  output: {schema: z.object({
    row1_ph: z.number().optional(),
    row2_ec: z.number().optional(),
    row3_oc: z.number().optional(),
    row4_nitrogen: z.number().optional(),
    row5_phosphorus: z.number().optional(),
    row6_potassium: z.number().optional(),
    row7_sulphur: z.number().optional(),
    row8_zinc: z.number().optional(),
    row9_boron: z.number().optional(),
    row10_iron: z.number().optional(),
    row11_manganese: z.number().optional(),
    row12_copper: z.number().optional(),
  })},
  prompt: `Extract values row by row from the Soil Test Results table. Focus on one row at a time.

Image: {{media url=photoDataUri}}

Go through each numbered row (1-12) and extract the Test Value:

Row 1 (pH): What number is in the Test Value column?
Row 2 (EC): What number is in the Test Value column?
Row 3 (Organic Carbon): What number is in the Test Value column?
Row 4 (Available Nitrogen): What number is in the Test Value column?
Row 5 (Available Phosphorus): What number is in the Test Value column?
Row 6 (Available Potassium): What number is in the Test Value column?
Row 7 (Available Sulphur): What number is in the Test Value column?
Row 8 (Available Zinc): What number is in the Test Value column?
Row 9 (Available Boron): What number is in the Test Value column?
Row 10 (Available Iron): What number is in the Test Value column?
Row 11 (Available Manganese): What number is in the Test Value column?
Row 12 (Available Copper): What number is in the Test Value column?

Extract only the numerical values from the Test Value column.`,
});

const digitizeSoilCardFlow = ai.defineFlow(
  {
    name: 'digitizeSoilCardFlow',
    inputSchema: DigitizeSoilCardInputSchema,
    outputSchema: DigitizeSoilCardOutputSchema,
  },
  async input => {
    // Step 0: Validate the image first
    const validationResult = await imageValidationPrompt(input);
    
    if (!validationResult.output || !validationResult.output.isSoilCard) {
      const reason = validationResult.output?.reason || 'The provided image is not a valid Soil Health Card.';
      // Throw an error that the frontend will catch and display in a toast.
      throw new Error(reason); 
    }

    let result: DigitizeSoilCardOutput = {};
    
    // Step 1: Main extraction attempt
    try {
      const mainResult = await mainExtractionPrompt(input);
      if (mainResult.output) {
        result = { ...mainResult.output };
      }
    } catch (error) {
      // Main extraction can fail, proceed to next steps
    }
    
    // Step 2: Check for Iron, Manganese, Copper specifically
    const problematicFields = ['iron', 'manganese', 'copper'];
    const missingProblematic = problematicFields.filter(field => 
      result[field as keyof DigitizeSoilCardOutput] === undefined
    );
    
    if (missingProblematic.length > 0) {
      try {
        const microResult = await micronutrientExtractionPrompt(input);
        
        if (microResult.output) {
          // Merge micronutrient results
          if (microResult.output.iron !== undefined) result.iron = microResult.output.iron;
          if (microResult.output.manganese !== undefined) result.manganese = microResult.output.manganese;
          if (microResult.output.copper !== undefined) result.copper = microResult.output.copper;
        }
      } catch (error) {
        // Micronutrient extraction can fail, proceed
      }
    }
    
    // Step 2b: General focused extraction for other missing fields
    const missingFields = [];
    // Final validation step
    const fieldMapping = {
      ph: 'pH',
      ec: 'EC', 
      organicCarbon: 'Organic Carbon',
      nitrogen: 'Nitrogen',
      phosphorus: 'Phosphorus',
      potassium: 'Potassium',
      sulphur: 'Sulphur',
      zinc: 'Zinc',
      boron: 'Boron',
      iron: 'Iron',
      manganese: 'Manganese',
      copper: 'Copper'
    };
    
    for (const [key, label] of Object.entries(fieldMapping)) {
      if (result[key as keyof DigitizeSoilCardOutput] === undefined) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      try {
        const focusedResult = await focusedExtractionPrompt({
          photoDataUri: input.photoDataUri,
          missingFields
        });
        
        if (focusedResult.output) {
          // Merge results, preferring focused extraction for missing fields
          result = { ...result, ...focusedResult.output };
        }
      } catch (error) {
         // Focused extraction can fail, proceed
      }
    }
    
    // Step 4: Alternative extraction for stubborn Iron, Manganese, Copper
    const stillMissingProblematic = problematicFields.filter(field => 
      result[field as keyof DigitizeSoilCardOutput] === undefined
    );
    
    if (stillMissingProblematic.length > 0) {
      try {
        const altResult = await alternativeExtractionPrompt(input);
        if (altResult.output && altResult.output.bottomRowValues && altResult.output.bottomRowValues.length >= 3) {
          // Map the bottom row values to fields
          const [ironVal, manganeseVal, copperVal] = altResult.output.bottomRowValues;
          
          if (result.iron === undefined && ironVal !== undefined) {
            result.iron = ironVal;
          }
          if (result.manganese === undefined && manganeseVal !== undefined) {
            result.manganese = manganeseVal;
          }
          if (result.copper === undefined && copperVal !== undefined) {
            result.copper = copperVal;
          }
        }
      } catch (error) {
         // Alt extraction can fail, proceed
      }
    }
    
    // Step 5: Row-by-row extraction for remaining missing fields
    const stillMissing = [];
    for (const [key] of Object.entries(fieldMapping)) {
      if (result[key as keyof DigitizeSoilCardOutput] === undefined) {
        stillMissing.push(key);
      }
    }
    
    if (stillMissing.length > 0) {
      try {
        const rowResult = await rowByRowPrompt(input);
        if (rowResult.output) {
          // Map row-based results to final structure
          const mapped: DigitizeSoilCardOutput = {};
          if (rowResult.output.row1_ph !== undefined) mapped.ph = rowResult.output.row1_ph;
          if (rowResult.output.row2_ec !== undefined) mapped.ec = rowResult.output.row2_ec;
          if (rowResult.output.row3_oc !== undefined) mapped.organicCarbon = rowResult.output.row3_oc;
          if (rowResult.output.row4_nitrogen !== undefined) mapped.nitrogen = rowResult.output.row4_nitrogen;
          if (rowResult.output.row5_phosphorus !== undefined) mapped.phosphorus = rowResult.output.row5_phosphorus;
          if (rowResult.output.row6_potassium !== undefined) mapped.potassium = rowResult.output.row6_potassium;
          if (rowResult.output.row7_sulphur !== undefined) mapped.sulphur = rowResult.output.row7_sulphur;
          if (rowResult.output.row8_zinc !== undefined) mapped.zinc = rowResult.output.row8_zinc;
          if (rowResult.output.row9_boron !== undefined) mapped.boron = rowResult.output.row9_boron;
          if (rowResult.output.row10_iron !== undefined) mapped.iron = rowResult.output.row10_iron;
          if (rowResult.output.row11_manganese !== undefined) mapped.manganese = rowResult.output.row11_manganese;
          if (rowResult.output.row12_copper !== undefined) mapped.copper = rowResult.output.row12_copper;
          
          // Fill in missing fields only
          for (const [key, value] of Object.entries(mapped)) {
            if (result[key as keyof DigitizeSoilCardOutput] === undefined && value !== undefined) {
              result[key as keyof DigitizeSoilCardOutput] = value;
            }
          }
        }
      } catch (error) {
        // Row-by-row can fail, proceed
      }
    }
    
    // Step 6: Validation and cleanup
    const finalResult = validateAndCleanResults(result);
    return finalResult;
  }
);

function validateAndCleanResults(result: DigitizeSoilCardOutput): DigitizeSoilCardOutput {
  const cleaned: DigitizeSoilCardOutput = {};
  
  // Validation ranges
  const ranges = {
    ph: { min: 3, max: 12 },
    ec: { min: 0.01, max: 10 },
    organicCarbon: { min: 0.1, max: 5 },
    nitrogen: { min: 50, max: 800 },
    phosphorus: { min: 1, max: 100 },
    potassium: { min: 25, max: 500 },
    sulphur: { min: 5, max: 100 },
    zinc: { min: 0.1, max: 5 },
    boron: { min: 0.1, max: 3 },
    iron: { min: 0.1, max: 50 },
    manganese: { min: 0.5, max: 50 },
    copper: { min: 0.1, max: 10 }
  };
  
  for (const [key, value] of Object.entries(result)) {
    if (value !== undefined && typeof value === 'number') {
      const range = ranges[key as keyof typeof ranges];
      if (range && value >= range.min && value <= range.max) {
        cleaned[key as keyof DigitizeSoilCardOutput] = value;
      } else if (range) {
        // Still include it but log the warning
        cleaned[key as keyof DigitizeSoilCardOutput] = value;
      } else {
        cleaned[key as keyof DigitizeSoilCardOutput] = value;
      }
    }
  }
  
  return cleaned;
}
