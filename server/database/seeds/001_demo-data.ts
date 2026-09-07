import type { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  const email = "demo@servis110.test";
  if (await knex("users").where({ email }).first()) return;

  await knex.transaction(async (trx) => {
    const [workshop] = await trx("workshops").insert({ name: "Servis 110 Demo" }).returning("id");
    await trx("users").insert({
      workshop_id: workshop.id,
      name: "Demo Kullanıcı",
      email,
      password_hash: await bcrypt.hash("Demo1234!", 12),
      role: "owner",
    });
  });
}
