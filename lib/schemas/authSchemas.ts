import { z } from "zod";

// Shared validation schemas for authentication forms
export const authSchemas = {
  // Username validation - used in both login and register
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),

  // Email validation - used in register
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  // Password validation - used in both login and register
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
};

// Complete form schemas
export const loginFormSchema = z.object({
  username: authSchemas.username,
  password: authSchemas.password,
});

export const registerFormSchema = z.object({
  username: authSchemas.username,
  email: authSchemas.email,
  password: authSchemas.password,
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
