import { db } from "../config/database.js";

export const dashboardRepository = {
  async get(workshopId: string) {
    const [vehicleCount, customerCount, recentServices, maintenance] = await Promise.all([
      db("vehicles").where({ workshop_id: workshopId }).count<{ count: string }>("id as count").first(),
      db("customers").where({ workshop_id: workshopId }).count<{ count: string }>("id as count").first(),
      db("service_records as sr")
        .join("vehicles as v", "v.id", "sr.vehicle_id")
        .join("customers as c", "c.id", "v.customer_id")
        .where("sr.workshop_id", workshopId)
        .select("sr.id", "sr.service_date as serviceDate", "sr.service_type as serviceType", "sr.mileage", "v.id as vehicleId", "v.plate", "v.brand", "v.model", "c.name as customerName")
        .orderBy("sr.service_date", "desc")
        .orderBy("sr.created_at", "desc")
        .limit(10),
      db.raw(`
        SELECT r.id AS "reminderId", r.title,
          v.id AS "vehicleId", v.plate, v.brand, v.model,
          v.current_mileage AS "currentMileage", c.name AS "customerName",
          r.due_date AS "nextServiceDate",
          r.due_mileage AS "nextServiceMileage",
          CASE
            WHEN r.due_date < CURRENT_DATE
              OR r.due_mileage <= v.current_mileage THEN 'overdue'
            ELSE 'upcoming'
          END AS status
        FROM maintenance_reminders r
        JOIN vehicles v ON v.id = r.vehicle_id
        JOIN customers c ON c.id = v.customer_id
        WHERE r.workshop_id = ? AND r.status = 'active' AND (
          r.due_date < CURRENT_DATE OR r.due_mileage <= v.current_mileage
          OR r.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
          OR r.due_mileage BETWEEN v.current_mileage + 1 AND v.current_mileage + 1000
        )
        ORDER BY status, r.due_date NULLS LAST, r.due_mileage NULLS LAST
      `, [workshopId]),
    ]);

    const reminders = maintenance.rows as Array<Record<string, unknown>>;
    return {
      stats: {
        totalVehicles: Number(vehicleCount?.count ?? 0),
        totalCustomers: Number(customerCount?.count ?? 0),
        upcomingMaintenance: reminders.filter((item) => item.status === "upcoming").length,
        overdueMaintenance: reminders.filter((item) => item.status === "overdue").length,
      },
      recentServices,
      upcomingMaintenance: reminders.filter((item) => item.status === "upcoming"),
      overdueMaintenance: reminders.filter((item) => item.status === "overdue"),
    };
  },
};
