import { z } from "zod";

const currentYear = new Date().getFullYear() + 1;

export const vehicleSchema = z.object({
  customerId: z.uuid(),
  plate: z.string().trim().min(2).max(20),
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.number().int().min(1900).max(currentYear).nullish(),
  currentMileage: z.number().int().nonnegative(),
});

export const updateVehicleSchema = vehicleSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "En az bir alan gönderilmelidir",
});

export const plateQuerySchema = z.object({ plate: z.string().trim().min(1).max(20) });

export const publicTokenParamsSchema = z.object({ token: z.uuid() });
