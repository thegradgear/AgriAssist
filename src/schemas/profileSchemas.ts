
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
  contactNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val) || val === '', {
    message: "Invalid phone number format. Should be like +1234567890 or empty.",
  }),
  otherDetails: z.string().max(500, { message: 'Other details cannot exceed 500 characters.' }).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
