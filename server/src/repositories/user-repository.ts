import type { Knex } from "knex";
import { db } from "../config/database.js";
import type { User } from "../types/entities.js";

const userColumns = [
  "id", "workshop_id as workshopId", "name", "email", "password_hash as passwordHash",
  "role", "is_active as isActive",
];

export const userRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    return db("users").select(userColumns).where({ email }).first();
  },

  async findById(id: string, workshopId: string) {
    return db("users")
      .select("id", "workshop_id as workshopId", "name", "email", "role", "is_active as isActive", "created_at as createdAt")
      .where({ id, workshop_id: workshopId })
      .first();
  },

  async createOwner(input: { workshopName: string; name: string; email: string; passwordHash: string }) {
    return db.transaction(async (trx: Knex.Transaction) => {
      const [workshop] = await trx("workshops").insert({ name: input.workshopName }).returning(["id", "name"]);
      const [user] = await trx("users").insert({
        workshop_id: workshop.id,
        name: input.name,
        email: input.email,
        password_hash: input.passwordHash,
        role: "owner",
      }).returning(["id", "workshop_id as workshopId", "name", "email", "role"]);
      return { user, workshop };
    });
  },
};
