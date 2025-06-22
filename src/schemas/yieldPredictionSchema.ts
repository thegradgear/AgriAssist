import { z } from 'zod';

export const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky", "Black Cotton", "Red Soil"] as const;
export const irrigationOptions = ["Rain-fed", "Well-irrigated (Canal/Borewell)", "Drip Irrigation", "Sprinkler System"] as const;

export const yieldPredictionSchema = z.object({
  state: z.string().min(1, { message: 'State is required.' }),
  district: z.string().min(1, { message: 'District is required.' }),
  season: z.string().min(1, { message: 'Season is required.' }),
  crop: z.string().min(1, { message: 'Crop name is required.' }),
  area: z.coerce.number().positive({ message: 'Area must be a positive number.' }),
  soilType: z.enum(soilTypes).optional(),
  irrigationAvailability: z.enum(irrigationOptions).optional(),
});

export type YieldPredictionFormData = z.infer<typeof yieldPredictionSchema>;
