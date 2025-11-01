import { z } from "zod";

export const setUpSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({message: 'Invalid email address'}),
  accessId: z.string().min(1, {message: 'Access ID is required'}),
});

export type SetUpValues = z.infer<typeof setUpSchema>;

export const setPasswordSchema = z.object({
  password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
  confirmPassword: z.string().min(8, {message: 'Password must be at least 8 characters'}),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export const loginSchema = z.object({
  email: z.string().email({message: 'Invalid email address'}),
  password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
});

export type LoginValues = z.infer<typeof loginSchema>;