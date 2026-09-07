import { Router } from "express";
import { serviceRecordController } from "../controllers/service-record-controller.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema } from "../validations/common-validation.js";
import { updateServiceRecordSchema } from "../validations/service-record-validation.js";

export const serviceRecordRoutes = Router();

serviceRecordRoutes.get("/:id", validate({ params: idParamsSchema }), serviceRecordController.get);
serviceRecordRoutes.patch("/:id", validate({ params: idParamsSchema, body: updateServiceRecordSchema }), serviceRecordController.update);
serviceRecordRoutes.delete("/:id", validate({ params: idParamsSchema }), serviceRecordController.remove);
