import { z } from "zod";

export const reminderSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    dueDate: z.iso.date().nullish(),
    dueMileage: z.number().int().nonnegative().nullish(),
    notes: z.string().trim().max(2000).nullish(),
  })
  .refine((data) => data.dueDate != null || data.dueMileage != null, {
    message: "Hatırlatıcı için tarih veya kilometre girilmelidir",
    path: ["dueDate"],
  });

export const reminderStatusSchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]),
});
