import { z } from 'zod';

export const yieldPredictionSchema = z.object({
  state: z.string().min(1, { message: 'State is required.' }),
  district: z.string().min(1, { message: 'District is required.' }),
  season: z.string().min(1, { message: 'Season is required.' }),
  crop: z.string().min(1, { message: 'Crop name is required.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
});

export type YieldPredictionFormData = z.infer<typeof yieldPredictionSchema>;
