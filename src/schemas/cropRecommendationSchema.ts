import { z } from 'zod';

export const cropRecommendationSchema = z.object({
  // Macro Nutrients (Primary)
  nitrogen: z.coerce.number().min(0, { message: 'Nitrogen must be non-negative.' }),
  phosphorus: z.coerce.number().min(0, { message: 'Phosphorus must be non-negative.' }),
  potassium: z.coerce.number().min(0, { message: 'Potassium must be non-negative.' }),
  
  // Other Primary Soil Parameters
  ph: z.coerce.number().min(0).max(14, { message: 'pH must be between 0 and 14.' }),
  ec: z.coerce.number().min(0, { message: 'EC must be non-negative.' }),
  organicCarbon: z.coerce.number().min(0, { message: 'Organic Carbon must be non-negative.' }),
  
  // Macro Nutrients (Secondary)
  sulphur: z.coerce.number().min(0, { message: 'Sulphur must be non-negative.' }),
  
  // Micro Nutrients
  zinc: z.coerce.number().min(0, { message: 'Zinc must be non-negative.' }),
  boron: z.coerce.number().min(0, { message: 'Boron must be non-negative.' }),
  iron: z.coerce.number().min(0, { message: 'Iron must be non-negative.' }),
  manganese: z.coerce.number().min(0, { message: 'Manganese must be non-negative.' }),
  copper: z.coerce.number().min(0, { message: 'Copper must be non-negative.' }),

  // Climate Parameters
  temperature: z.coerce.number(), 
  humidity: z.coerce.number().min(0).max(100, { message: 'Humidity must be between 0 and 100.' }),
  rainfall: z.coerce.number().min(0, { message: 'Rainfall must be non-negative.' }),
});

export type CropRecommendationFormData = z.infer<typeof cropRecommendationSchema>;
