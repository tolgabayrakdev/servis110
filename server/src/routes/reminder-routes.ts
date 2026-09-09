import { Router } from "express";
import { reminderController } from "../controllers/reminder-controller.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema } from "../validations/common-validation.js";
import { reminderStatusSchema } from "../validations/reminder-validation.js";

export const reminderRoutes = Router();
reminderRoutes.patch("/:id", validate({ params: idParamsSchema, body: reminderStatusSchema }), reminderController.updateStatus);
reminderRoutes.delete("/:id", validate({ params: idParamsSchema }), reminderController.remove);
