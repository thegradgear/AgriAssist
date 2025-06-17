import { z } from 'zod';

export const cropRecommendationSchema = z.object({
  nitrogen: z.coerce.number().min(0, { message: 'Nitrogen must be non-negative.' }),
  phosphorus: z.coerce.number().min(0, { message: 'Phosphorus must be non-negative.' }),
  potassium: z.coerce.number().min(0, { message: 'Potassium must be non-negative.' }),
  temperature: z.coerce.number(), 
  humidity: z.coerce.number().min(0).max(100, { message: 'Humidity must be between 0 and 100.' }),
  ph: z.coerce.number().min(0).max(14, { message: 'pH must be between 0 and 14.' }),
  rainfall: z.coerce.number().min(0, { message: 'Rainfall must be non-negative.' }),
});

export type CropRecommendationFormData = z.infer<typeof cropRecommendationSchema>;
