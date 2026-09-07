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
        WITH latest AS (
          SELECT DISTINCT ON (sr.vehicle_id)
            sr.vehicle_id, sr.next_service_date, sr.next_service_mileage
          FROM service_records sr
          WHERE sr.workshop_id = ?
          ORDER BY sr.vehicle_id, sr.service_date DESC, sr.created_at DESC
        )
        SELECT v.id AS "vehicleId", v.plate, v.brand, v.model,
          v.current_mileage AS "currentMileage", c.name AS "customerName",
          latest.next_service_date AS "nextServiceDate",
          latest.next_service_mileage AS "nextServiceMileage",
          CASE
            WHEN latest.next_service_date < CURRENT_DATE
              OR latest.next_service_mileage <= v.current_mileage THEN 'overdue'
            ELSE 'upcoming'
          END AS status
        FROM latest
        JOIN vehicles v ON v.id = latest.vehicle_id
        JOIN customers c ON c.id = v.customer_id
        WHERE (latest.next_service_date < CURRENT_DATE
          OR latest.next_service_mileage <= v.current_mileage)
          OR (latest.next_service_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
          OR latest.next_service_mileage BETWEEN v.current_mileage + 1 AND v.current_mileage + 1000)
        ORDER BY status, latest.next_service_date NULLS LAST
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
