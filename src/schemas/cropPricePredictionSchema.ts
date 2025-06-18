
import { z } from 'zod';

const currentYear = new Date().getFullYear();
const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
] as const;

export const cropPricePredictionSchema = z.object({
  cropName: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }).max(50, { message: 'Crop name cannot exceed 50 characters.' }),
  marketLocation: z.string().min(2, { message: 'Market location must be at least 2 characters.' }).max(100, { message: 'Market location cannot exceed 100 characters.' }),
  monthOfSale: z.enum(months, { errorMap: () => ({ message: "Please select a valid month." }) }),
  yearOfSale: z.coerce.number().int().min(currentYear, { message: `Year must be ${currentYear} or later.` }).max(currentYear + 5, { message: `Year cannot be more than 5 years in the future.` }),
  gradeOrQuality: z.string().max(50, { message: 'Grade/Quality cannot exceed 50 characters.' }).optional().or(z.literal('')),
  historicalPriceData: z.string().max(250, { message: 'Historical data summary cannot exceed 250 characters.' }).optional().or(z.literal('')),
});

export type CropPricePredictionFormData = z.infer<typeof cropPricePredictionSchema>;
