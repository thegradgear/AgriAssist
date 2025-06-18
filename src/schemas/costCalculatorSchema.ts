
import { z } from 'zod';

export const costItemSchema = z.object({
  id: z.string().optional(), // For useFieldArray key
  name: z.string().min(1, "Item name is required."),
  costPerUnit: z.coerce.number().positive("Cost must be positive."),
  quantity: z.coerce.number().positive("Quantity must be positive."),
  unit: z.string().min(1, "Unit is required (e.g., kg, L, hrs, item)."),
});
export type CostItemFormData = z.infer<typeof costItemSchema>;

export const costCalculatorSchema = z.object({
  cropName: z.string().min(2, "Crop name must be at least 2 characters.").max(50, "Crop name too long."),
  area: z.coerce.number().positive("Area must be a positive number."),
  areaUnit: z.enum(['acre', 'hectare'], { required_error: "Area unit is required." }),
  
  costItems: z.array(costItemSchema).min(1, "At least one cost item is required."),
  
  expectedYield: z.coerce.number().positive("Expected yield must be a positive number."),
  yieldUnit: z.enum(['kg', 'quintal', 'tonne'], { required_error: "Yield unit is required." }),
  yieldPerAreaUnit: z.enum(['acre', 'hectare'], { required_error: "Yield per area unit is required." }),

  expectedMarketPrice: z.coerce.number().positive("Market price must be a positive number."),
  pricePerYieldUnit: z.enum(['kg', 'quintal', 'tonne'], { required_error: "Price per yield unit is required." }),
});

export type CostCalculatorFormData = z.infer<typeof costCalculatorSchema>;

// Helper for default cost items
export const defaultCostItems: CostItemFormData[] = [
  { name: 'Seeds', costPerUnit: 0, quantity: 0, unit: 'kg' },
  { name: 'Fertilizer (Urea)', costPerUnit: 0, quantity: 0, unit: 'bag' },
  { name: 'Pesticides/Herbicides', costPerUnit: 0, quantity: 0, unit: 'Litre/kg' },
  { name: 'Labor (Planting)', costPerUnit: 0, quantity: 0, unit: 'days' },
  { name: 'Machinery (Tractor)', costPerUnit: 0, quantity: 0, unit: 'hours' },
];
