import { db } from "../config/database.js";
import type { ServiceRecordInput } from "../types/entities.js";

const columns = [
  "id", "vehicle_id as vehicleId", "service_date as serviceDate", "mileage", "service_type as serviceType",
  "operations", "replaced_parts as replacedParts", "description", "next_service_date as nextServiceDate",
  "next_service_mileage as nextServiceMileage", "created_at as createdAt", "updated_at as updatedAt",
];

const toRow = (input: Partial<ServiceRecordInput>) => ({
  ...(input.serviceDate !== undefined && { service_date: input.serviceDate }),
  ...(input.mileage !== undefined && { mileage: input.mileage }),
  ...(input.serviceType !== undefined && { service_type: input.serviceType }),
  ...(input.operations !== undefined && { operations: JSON.stringify(input.operations) }),
  ...(input.replacedParts !== undefined && { replaced_parts: JSON.stringify(input.replacedParts) }),
  ...(input.description !== undefined && { description: input.description || null }),
  ...(input.nextServiceDate !== undefined && { next_service_date: input.nextServiceDate || null }),
  ...(input.nextServiceMileage !== undefined && { next_service_mileage: input.nextServiceMileage || null }),
  updated_at: db.fn.now(),
});

export const serviceRecordRepository = {
  async listByVehicle(vehicleId: string, workshopId: string) {
    return db("service_records").select(columns).where({ vehicle_id: vehicleId, workshop_id: workshopId }).orderBy("service_date", "desc").orderBy("created_at", "desc");
  },

  async findById(id: string, workshopId: string) {
    return db("service_records").select(columns).where({ id, workshop_id: workshopId }).first();
  },

  async create(vehicleId: string, workshopId: string, input: ServiceRecordInput) {
    return db.transaction(async (trx) => {
      const [record] = await trx("service_records").insert({ vehicle_id: vehicleId, workshop_id: workshopId, ...toRow(input) }).returning(columns);
      await trx("vehicles")
        .where({ id: vehicleId, workshop_id: workshopId })
        .andWhere("current_mileage", "<", input.mileage)
        .update({ current_mileage: input.mileage, updated_at: trx.fn.now() });
      return record;
    });
  },

  async update(id: string, workshopId: string, input: Partial<ServiceRecordInput>) {
    const [record] = await db("service_records").where({ id, workshop_id: workshopId }).update(toRow(input)).returning(columns);
    return record;
  },

  async remove(id: string, workshopId: string) {
    return db("service_records").where({ id, workshop_id: workshopId }).delete();
  },
};
