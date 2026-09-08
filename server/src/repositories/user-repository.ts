import type { Knex } from "knex";
import { db } from "../config/database.js";
import type { User } from "../types/entities.js";

const userColumns = [
  "id",
  "workshop_id as workshopId",
  "name",
  "email",
  "password_hash as passwordHash",
  "role",
  "is_active as isActive",
];

const userQuery = () =>
  db("users").join("workshops", "workshops.id", "users.workshop_id");

export const userRepository = {
  async findByEmail(email: string): Promise<User | undefined> {
    return userQuery()
      .select([...userColumns.map((column) => `users.${column}`), "workshops.name as workshopName"])
      .where({ "users.email": email })
      .first();
  },

  async findById(id: string, workshopId: string) {
    return userQuery()
      .select(
        "users.id",
        "users.workshop_id as workshopId",
        "users.name",
        "users.email",
        "users.role",
        "users.is_active as isActive",
        "users.created_at as createdAt",
        "workshops.name as workshopName",
      )
      .where({ "users.id": id, "users.workshop_id": workshopId })
      .first();
  },

  async findWithPasswordById(
    id: string,
    workshopId: string,
  ): Promise<User | undefined> {
    return db("users")
      .select(userColumns)
      .where({ id, workshop_id: workshopId })
      .first();
  },

  async updateAccount(
    id: string,
    workshopId: string,
    input: { name: string; email: string; workshopName: string },
  ) {
    return db.transaction(async (trx: Knex.Transaction) => {
      await trx("workshops")
        .where({ id: workshopId })
        .update({ name: input.workshopName, updated_at: trx.fn.now() });
      await trx("users")
        .where({ id, workshop_id: workshopId })
        .update({
          name: input.name,
          email: input.email,
          updated_at: trx.fn.now(),
        });
      return trx("users")
        .join("workshops", "workshops.id", "users.workshop_id")
        .select(
          "users.id",
          "users.workshop_id as workshopId",
          "users.name",
          "users.email",
          "users.role",
          "workshops.name as workshopName",
        )
        .where({ "users.id": id, "users.workshop_id": workshopId })
        .first();
    });
  },

  async updatePassword(id: string, workshopId: string, passwordHash: string) {
    return db("users")
      .where({ id, workshop_id: workshopId })
      .update({ password_hash: passwordHash, updated_at: db.fn.now() });
  },

  async deleteAccount(id: string, workshopId: string, role: "owner" | "staff") {
    if (role === "owner")
      return db("workshops").where({ id: workshopId }).delete();
    return db("users").where({ id, workshop_id: workshopId }).delete();
  },

  async createOwner(input: {
    workshopName: string;
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return db.transaction(async (trx: Knex.Transaction) => {
      const [workshop] = await trx("workshops")
        .insert({ name: input.workshopName })
        .returning(["id", "name"]);
      const [user] = await trx("users")
        .insert({
          workshop_id: workshop.id,
          name: input.name,
          email: input.email,
          password_hash: input.passwordHash,
          role: "owner",
        })
        .returning([
          "id",
          "workshop_id as workshopId",
          "name",
          "email",
          "role",
        ]);
      return { user, workshop };
    });
  },
};
