import { db } from "../config/database.js";

export const publicCardRepository = {
  async findVehicle(token: string) {
    return db("vehicles as v")
      .join("workshops as w", "w.id", "v.workshop_id")
      .select(
        "v.id", "v.public_token as publicToken", "v.plate", "v.brand", "v.model", "v.year",
        "v.current_mileage as currentMileage", "w.name as workshopName",
      )
      .where("v.public_token", token)
      .first();
  },

  async history(vehicleId: string) {
    return db("service_records")
      .select("id", "service_date as serviceDate", "mileage", "service_type as serviceType", "operations", "replaced_parts as replacedParts", "description", "next_service_date as nextServiceDate", "next_service_mileage as nextServiceMileage")
      .where("vehicle_id", vehicleId)
      .orderBy("service_date", "desc");
  },
};
