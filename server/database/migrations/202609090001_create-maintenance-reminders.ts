import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("maintenance_reminders", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("workshop_id").notNullable().references("id").inTable("workshops").onDelete("CASCADE");
    table.uuid("vehicle_id").notNullable().references("id").inTable("vehicles").onDelete("CASCADE");
    table.uuid("source_service_record_id").references("id").inTable("service_records").onDelete("SET NULL");
    table.string("title", 120).notNullable();
    table.date("due_date");
    table.integer("due_mileage");
    table.text("notes");
    table.enum("status", ["active", "completed", "cancelled"]).notNullable().defaultTo("active");
    table.timestamp("completed_at", { useTz: true });
    table.timestamps(true, true);
    table.index(["workshop_id", "status", "due_date"]);
    table.index(["vehicle_id", "status"]);
  });

  await knex.raw(`
    INSERT INTO maintenance_reminders (
      workshop_id, vehicle_id, source_service_record_id, title,
      due_date, due_mileage, status, created_at, updated_at
    )
    SELECT DISTINCT ON (vehicle_id)
      workshop_id, vehicle_id, id, service_type || ' hatırlatması',
      next_service_date, next_service_mileage, 'active', NOW(), NOW()
    FROM service_records
    WHERE next_service_date IS NOT NULL OR next_service_mileage IS NOT NULL
    ORDER BY vehicle_id, service_date DESC, created_at DESC
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("maintenance_reminders");
}
