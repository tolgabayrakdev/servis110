import { Router } from "express";
import { customerController } from "../controllers/customer-controller.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema, paginationQuerySchema } from "../validations/common-validation.js";
import { customerSchema, updateCustomerSchema } from "../validations/customer-validation.js";

export const customerRoutes = Router();

customerRoutes.get("/", validate({ query: paginationQuerySchema }), customerController.list);
customerRoutes.get("/:id", validate({ params: idParamsSchema }), customerController.get);
customerRoutes.post("/", validate({ body: customerSchema }), customerController.create);
customerRoutes.patch("/:id", validate({ params: idParamsSchema, body: updateCustomerSchema }), customerController.update);
customerRoutes.delete("/:id", validate({ params: idParamsSchema }), customerController.remove);
