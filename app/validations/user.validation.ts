import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  role: z.enum(["USER", "ADMIN"]),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  email: z
    .string()
    .email("Invalid email address")
    .optional(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),

  role: z
    .enum(["SUPER_ADMIN", "ADMIN"])
    .optional(),

  blocked: z
    .boolean()
    .optional(),
});