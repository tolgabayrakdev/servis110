import { Router } from "express";
import { publicCardController } from "../controllers/public-card-controller.js";
import { validate } from "../middlewares/validate.js";
import { publicTokenParamsSchema } from "../validations/vehicle-validation.js";

export const publicCardRoutes = Router();

publicCardRoutes.get("/:token", validate({ params: publicTokenParamsSchema }), publicCardController.get);
