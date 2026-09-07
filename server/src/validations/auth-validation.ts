import { z } from "zod";

export const registerSchema = z.object({
  workshopName: z.string().trim().min(2).max(150),
  name: z.string().trim().min(2).max(120),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1).max(72),
});
