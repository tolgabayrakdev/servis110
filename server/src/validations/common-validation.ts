import { z } from "zod";

export const idParamsSchema = z.object({ id: z.uuid() });
export const vehicleIdParamsSchema = z.object({ vehicleId: z.uuid() });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  search: z.string().trim().max(100).optional(),
});
