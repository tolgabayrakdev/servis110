import { z } from "zod";

const serviceRecordBaseSchema = z.object({
  serviceDate: z.iso.date(),
  mileage: z.number().int().nonnegative(),
  serviceType: z.string().trim().min(2).max(100),
  operations: z.array(z.string().trim().min(1).max(300)).max(100).default([]),
  replacedParts: z.array(z.string().trim().min(1).max(300)).max(100).default([]),
  description: z.string().trim().max(5000).nullish(),
});

export const serviceRecordSchema = serviceRecordBaseSchema;

export const updateServiceRecordSchema = z
  .object({
    serviceDate: z.iso.date().optional(),
    mileage: z.number().int().nonnegative().optional(),
    serviceType: z.string().trim().min(2).max(100).optional(),
    operations: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
    replacedParts: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
    description: z.string().trim().max(5000).nullish(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "En az bir alan gönderilmelidir",
  });
