import { db } from "../config/database.js";

const columns = [
  "id",
  "vehicle_id as vehicleId",
  "title",
  "due_date as dueDate",
  "due_mileage as dueMileage",
  "notes",
  "status",
  "completed_at as completedAt",
  "created_at as createdAt",
];

export const reminderRepository = {
  list(vehicleId: string, workshopId: string) {
    return db("maintenance_reminders")
      .select(columns)
      .where({ vehicle_id: vehicleId, workshop_id: workshopId })
      .orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END")
      .orderBy("due_date", "asc", "last")
      .orderBy("created_at", "desc");
  },

  async create(
    vehicleId: string,
    workshopId: string,
    input: { title: string; dueDate?: string | null; dueMileage?: number | null; notes?: string | null },
  ) {
    const [reminder] = await db("maintenance_reminders")
      .insert({
        workshop_id: workshopId,
        vehicle_id: vehicleId,
        title: input.title,
        due_date: input.dueDate || null,
        due_mileage: input.dueMileage ?? null,
        notes: input.notes || null,
      })
      .returning(columns);
    return reminder;
  },

  async updateStatus(id: string, workshopId: string, status: "active" | "completed" | "cancelled") {
    const [reminder] = await db("maintenance_reminders")
      .where({ id, workshop_id: workshopId })
      .update({
        status,
        completed_at: status === "completed" ? db.fn.now() : null,
        updated_at: db.fn.now(),
      })
      .returning(columns);
    return reminder;
  },

  remove(id: string, workshopId: string) {
    return db("maintenance_reminders").where({ id, workshop_id: workshopId }).delete();
  },
};
