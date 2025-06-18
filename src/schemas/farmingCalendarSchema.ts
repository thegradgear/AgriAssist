import { z } from 'zod';
import { format } from 'date-fns';

const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky", "Not Sure"] as const;
const farmingPractices = ["Conventional", "Organic", "Integrated Pest Management (IPM)", "Other"] as const;

export const farmingCalendarSchema = z.object({
  cropName: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }).max(50, { message: 'Crop name cannot exceed 50 characters.' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }).max(100, { message: 'Location cannot exceed 100 characters.' }),
  plantingDate: z.date({
    required_error: "Planting date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  soilType: z.enum(soilTypes).optional(),
  farmingPractice: z.enum(farmingPractices).optional(),
});

export type FarmingCalendarFormData = z.infer<typeof farmingCalendarSchema>;

// Helper to format date for AI flow
export const formatDataForAI = (data: FarmingCalendarFormData) => {
  return {
    ...data,
    plantingDate: format(data.plantingDate, 'yyyy-MM-dd'),
    // Optional fields will be undefined if not selected, which is fine for the AI
    soilType: data.soilType === "Not Sure" ? undefined : data.soilType,
  };
};
