import { Router } from "express";
import { serviceRecordController } from "../controllers/service-record-controller.js";
import { reminderController } from "../controllers/reminder-controller.js";
import { vehicleController } from "../controllers/vehicle-controller.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema, paginationQuerySchema, vehicleIdParamsSchema } from "../validations/common-validation.js";
import { serviceRecordSchema } from "../validations/service-record-validation.js";
import { reminderSchema } from "../validations/reminder-validation.js";
import { plateQuerySchema, updateVehicleSchema, vehicleSchema } from "../validations/vehicle-validation.js";

export const vehicleRoutes = Router();

vehicleRoutes.get("/", validate({ query: paginationQuerySchema }), vehicleController.list);
vehicleRoutes.get("/search", validate({ query: plateQuerySchema }), vehicleController.findByPlate);
vehicleRoutes.get("/:id", validate({ params: idParamsSchema }), vehicleController.get);
vehicleRoutes.post("/", validate({ body: vehicleSchema }), vehicleController.create);
vehicleRoutes.patch("/:id", validate({ params: idParamsSchema, body: updateVehicleSchema }), vehicleController.update);
vehicleRoutes.delete("/:id", validate({ params: idParamsSchema }), vehicleController.remove);
vehicleRoutes.get("/:vehicleId/service-records", validate({ params: vehicleIdParamsSchema }), serviceRecordController.list);
vehicleRoutes.post("/:vehicleId/service-records", validate({ params: vehicleIdParamsSchema, body: serviceRecordSchema }), serviceRecordController.create);
vehicleRoutes.get("/:vehicleId/reminders", validate({ params: vehicleIdParamsSchema }), reminderController.list);
vehicleRoutes.post("/:vehicleId/reminders", validate({ params: vehicleIdParamsSchema, body: reminderSchema }), reminderController.create);
