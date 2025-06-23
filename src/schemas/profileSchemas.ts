
import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
  contactNumber: z.string().optional().refine(val => !val || /^\+?[1-9]\d{1,14}$/.test(val) || val === '', {
    message: "Invalid phone number format. Should be like +1234567890 or empty.",
  }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;


export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[a-z])/, { message: "Must contain at least one lowercase letter." })
    .regex(/(?=.*[A-Z])/, { message: "Must contain at least one uppercase letter." })
    .regex(/(?=.*\d)/, { message: "Must contain at least one number." })
    .regex(/(?=.*[@$!%*?&])/, { message: "Must contain at least one special character." }),
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match.",
  path: ['confirmNewPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
