import { db } from "../config/database.js";
import type { VehicleInput } from "../types/entities.js";
import type { Pagination } from "../types/index.js";
import { normalizePlate } from "../utils/plate.js";

const selectColumns = [
  "vehicles.id", "vehicles.customer_id as customerId", "vehicles.plate", "vehicles.brand", "vehicles.model",
  "vehicles.year", "vehicles.current_mileage as currentMileage", "vehicles.public_token as publicToken",
  "vehicles.created_at as createdAt", "vehicles.updated_at as updatedAt", "customers.name as customerName", "customers.phone as customerPhone",
];

const toRow = (input: Partial<VehicleInput>) => ({
  ...(input.customerId !== undefined && { customer_id: input.customerId }),
  ...(input.plate !== undefined && { plate: input.plate }),
  ...(input.brand !== undefined && { brand: input.brand }),
  ...(input.model !== undefined && { model: input.model }),
  ...(input.year !== undefined && { year: input.year }),
  ...(input.currentMileage !== undefined && { current_mileage: input.currentMileage }),
  updated_at: db.fn.now(),
});

const baseQuery = () => db("vehicles").join("customers", "customers.id", "vehicles.customer_id");

export const vehicleRepository = {
  async list(workshopId: string, pagination: Pagination, search?: string) {
    const base = baseQuery().where("vehicles.workshop_id", workshopId);
    if (search) {
      const plateSearch = normalizePlate(search);
      base.andWhere((query) => query
        .whereILike("vehicles.plate", `%${plateSearch}%`)
        .orWhereILike("vehicles.brand", `%${search}%`)
        .orWhereILike("vehicles.model", `%${search}%`)
        .orWhereILike("customers.name", `%${search}%`));
    }
    const [items, countRow] = await Promise.all([
      base.clone().select(selectColumns).orderBy("vehicles.created_at", "desc").limit(pagination.limit).offset(pagination.offset),
      base.clone().clearSelect().count<{ count: string }>("vehicles.id as count").first(),
    ]);
    return { items, total: Number(countRow?.count ?? 0) };
  },

  async findById(id: string, workshopId: string) {
    return baseQuery().select(selectColumns).where({ "vehicles.id": id, "vehicles.workshop_id": workshopId }).first();
  },

  async findByPlate(plate: string, workshopId: string) {
    return baseQuery().select(selectColumns).where({ "vehicles.plate": plate, "vehicles.workshop_id": workshopId }).first();
  },

  async create(workshopId: string, input: VehicleInput) {
    const [row] = await db("vehicles").insert({ workshop_id: workshopId, ...toRow(input) }).returning("id");
    return this.findById(row.id, workshopId);
  },

  async update(id: string, workshopId: string, input: Partial<VehicleInput>) {
    const [row] = await db("vehicles").where({ id, workshop_id: workshopId }).update(toRow(input)).returning("id");
    return row ? this.findById(row.id, workshopId) : undefined;
  },

  async remove(id: string, workshopId: string) {
    return db("vehicles").where({ id, workshop_id: workshopId }).delete();
  },
};
