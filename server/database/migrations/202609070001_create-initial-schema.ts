import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable("workshops", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name", 150).notNullable();
    table.string("phone", 30);
    table.string("address", 500);
    table.timestamps(true, true);
  });

  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("workshop_id").notNullable().references("id").inTable("workshops").onDelete("CASCADE");
    table.string("name", 120).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password_hash", 255).notNullable();
    table.enum("role", ["owner", "staff"]).notNullable().defaultTo("staff");
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamps(true, true);
    table.index("workshop_id");
  });

  await knex.schema.createTable("customers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("workshop_id").notNullable().references("id").inTable("workshops").onDelete("CASCADE");
    table.string("name", 150).notNullable();
    table.string("phone", 30).notNullable();
    table.string("email", 255);
    table.string("address", 500);
    table.text("notes");
    table.timestamps(true, true);
    table.index(["workshop_id", "name"]);
    table.index(["workshop_id", "phone"]);
  });

  await knex.schema.createTable("vehicles", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("workshop_id").notNullable().references("id").inTable("workshops").onDelete("CASCADE");
    table.uuid("customer_id").notNullable().references("id").inTable("customers").onDelete("RESTRICT");
    table.string("plate", 20).notNullable();
    table.string("brand", 80).notNullable();
    table.string("model", 80).notNullable();
    table.smallint("year");
    table.integer("current_mileage").notNullable().defaultTo(0);
    table.uuid("public_token").notNullable().unique().defaultTo(knex.raw("gen_random_uuid()"));
    table.timestamps(true, true);
    table.unique(["workshop_id", "plate"]);
    table.index("customer_id");
  });

  await knex.schema.createTable("service_records", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("workshop_id").notNullable().references("id").inTable("workshops").onDelete("CASCADE");
    table.uuid("vehicle_id").notNullable().references("id").inTable("vehicles").onDelete("CASCADE");
    table.date("service_date").notNullable();
    table.integer("mileage").notNullable();
    table.string("service_type", 100).notNullable();
    table.jsonb("operations").notNullable().defaultTo("[]");
    table.jsonb("replaced_parts").notNullable().defaultTo("[]");
    table.text("description");
    table.date("next_service_date");
    table.integer("next_service_mileage");
    table.timestamps(true, true);
    table.index(["workshop_id", "service_date"]);
    table.index(["vehicle_id", "service_date"]);
    table.index(["workshop_id", "next_service_date"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("service_records");
  await knex.schema.dropTableIfExists("vehicles");
  await knex.schema.dropTableIfExists("customers");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("workshops");
}
