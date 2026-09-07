import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(7).max(30),
  email: z.email().toLowerCase().nullish(),
  address: z.string().trim().max(500).nullish(),
  notes: z.string().trim().max(2000).nullish(),
});

export const updateCustomerSchema = customerSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "En az bir alan gönderilmelidir",
});
