import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("customers", (table) => {
    table.string("phone", 30).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex("customers").whereNull("phone").update({ phone: "" });
  await knex.schema.alterTable("customers", (table) => {
    table.string("phone", 30).notNullable().alter();
  });
}
