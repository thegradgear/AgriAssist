
import { z } from 'zod';
import { format } from 'date-fns';

const soilTypes = ["Loamy", "Sandy", "Clay", "Silt", "Peaty", "Chalky", "Not Sure"] as const;
const farmingPractices = ["Conventional", "Organic", "Integrated Pest Management (IPM)", "Other"] as const;

export const farmingCalendarSchema = z.object({
  cropName: z.string().min(2, { message: 'Crop name must be at least 2 characters.' }).max(50, { message: 'Crop name cannot exceed 50 characters.' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters.' }).max(100, { message: 'Location cannot exceed 100 characters.' }),
  plantingDate: z.date({    
    required_error: "A planting date is required.",
    invalid_type_error: "That's not a valid date!",
  }),
  soilType: z.enum(soilTypes).optional().nullable(),
  farmingPractice: z.enum(farmingPractices).optional().nullable(),
});

export type FarmingCalendarFormData = z.infer<typeof farmingCalendarSchema>;

// Helper to format date for AI flow, ensures plantingDate exists
export const formatDataForAI = (data: FarmingCalendarFormData) => {
  return {
    ...data,
    plantingDate: format(data.plantingDate, 'yyyy-MM-dd'),
    // AI prompt expects undefined for optional fields, not null.
    soilType: (data.soilType === "Not Sure" || data.soilType === null) ? undefined : data.soilType,
    farmingPractice: data.farmingPractice === null ? undefined : data.farmingPractice,
  };
};
