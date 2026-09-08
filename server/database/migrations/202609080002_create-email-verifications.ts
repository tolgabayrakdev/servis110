import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("email_verified_at", { useTz: true });
  });
  // Bu özellik eklenmeden önce oluşturulan hesapların erişimini kesme.
  await knex("users").update({ email_verified_at: knex.fn.now() });

  await knex.schema.createTable("email_verification_codes", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("code_hash", 64).notNullable();
    table.timestamp("expires_at", { useTz: true }).notNullable();
    table.timestamp("used_at", { useTz: true });
    table.timestamps(true, true);
    table.index(["user_id", "expires_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("email_verification_codes");
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("email_verified_at");
  });
}
