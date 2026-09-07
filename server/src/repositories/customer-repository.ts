import { db } from "../config/database.js";
import type { CustomerInput } from "../types/entities.js";
import type { Pagination } from "../types/index.js";

const columns = ["id", "name", "phone", "email", "address", "notes", "created_at as createdAt", "updated_at as updatedAt"];

const toRow = (input: Partial<CustomerInput>) => ({
  ...(input.name !== undefined && { name: input.name }),
  ...(input.phone !== undefined && { phone: input.phone }),
  ...(input.email !== undefined && { email: input.email || null }),
  ...(input.address !== undefined && { address: input.address || null }),
  ...(input.notes !== undefined && { notes: input.notes || null }),
  updated_at: db.fn.now(),
});

export const customerRepository = {
  async list(workshopId: string, pagination: Pagination, search?: string) {
    const base = db("customers").where("workshop_id", workshopId);
    if (search) base.andWhere((query) => query.whereILike("name", `%${search}%`).orWhereILike("phone", `%${search}%`).orWhereILike("email", `%${search}%`));
    const [items, countRow] = await Promise.all([
      base.clone().select(columns).orderBy("name").limit(pagination.limit).offset(pagination.offset),
      base.clone().count<{ count: string }>("id as count").first(),
    ]);
    return { items, total: Number(countRow?.count ?? 0) };
  },

  async findById(id: string, workshopId: string) {
    return db("customers").select(columns).where({ id, workshop_id: workshopId }).first();
  },

  async create(workshopId: string, input: CustomerInput) {
    const [customer] = await db("customers").insert({ workshop_id: workshopId, ...toRow(input) }).returning(columns);
    return customer;
  },

  async update(id: string, workshopId: string, input: Partial<CustomerInput>) {
    const [customer] = await db("customers").where({ id, workshop_id: workshopId }).update(toRow(input)).returning(columns);
    return customer;
  },

  async remove(id: string, workshopId: string) {
    return db("customers").where({ id, workshop_id: workshopId }).delete();
  },

  async vehicleCount(id: string, workshopId: string) {
    const row = await db("vehicles").where({ customer_id: id, workshop_id: workshopId }).count<{ count: string }>("id as count").first();
    return Number(row?.count ?? 0);
  },
};
