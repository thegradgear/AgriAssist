import { z } from 'zod';

export const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky"] as const;
export const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturation'] as const;

const dailyForecastSchema = z.object({
  day: z.string(), // e.g., "Monday"
  maxTempC: z.coerce.number(),
  rainfallMM: z.coerce.number().min(0, "Rainfall cannot be negative."),
});

export const irrigationSchema = z.object({
  cropType: z.string().min(2, "Crop name must be at least 2 characters."),
  soilType: z.enum(soilTypes, { required_error: "Please select a soil type." }),
  stageOfGrowth: z.enum(growthStages, { required_error: "Please select a growth stage." }),
  location: z.string().min(3, "Location is required for context."),
  forecast: z.array(dailyForecastSchema).length(7, "A 7-day forecast is required."),
});

export type IrrigationFormData = z.infer<typeof irrigationSchema>;
