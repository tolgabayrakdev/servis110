import { z } from "zod";

const serviceRecordBaseSchema = z.object({
  serviceDate: z.iso.date(),
  mileage: z.number().int().nonnegative(),
  serviceType: z.string().trim().min(2).max(100),
  operations: z.array(z.string().trim().min(1).max(300)).max(100).default([]),
  replacedParts: z.array(z.string().trim().min(1).max(300)).max(100).default([]),
  description: z.string().trim().max(5000).nullish(),
  nextServiceDate: z.iso.date().nullish(),
  nextServiceMileage: z.number().int().nonnegative().nullish(),
});

export const serviceRecordSchema = serviceRecordBaseSchema.refine((data) => data.nextServiceMileage == null || data.nextServiceMileage > data.mileage, {
  message: "Sonraki bakım kilometresi servis kilometresinden büyük olmalıdır",
  path: ["nextServiceMileage"],
}).refine((data) => data.nextServiceDate == null || data.nextServiceDate > data.serviceDate, {
  message: "Sonraki bakım tarihi servis tarihinden sonra olmalıdır",
  path: ["nextServiceDate"],
});

export const updateServiceRecordSchema = serviceRecordBaseSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "En az bir alan gönderilmelidir",
});
