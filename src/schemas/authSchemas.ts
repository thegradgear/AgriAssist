import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, { message: 'Name cannot exceed 50 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[a-z])/, { message: "Must contain at least one lowercase letter." })
    .regex(/(?=.*[A-Z])/, { message: "Must contain at least one uppercase letter." })
    .regex(/(?=.*\d)/, { message: "Must contain at least one number." })
    .regex(/(?=.*[@$!%*?&])/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
