import { Router } from "express";
import { dashboardController } from "../controllers/dashboard-controller.js";
import { healthController } from "../controllers/health-controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authRoutes } from "./auth-routes.js";
import { customerRoutes } from "./customer-routes.js";
import { publicCardRoutes } from "./public-card-routes.js";
import { serviceRecordRoutes } from "./service-record-routes.js";
import { vehicleRoutes } from "./vehicle-routes.js";
import { reminderRoutes } from "./reminder-routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", healthController.get);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/public/service-cards", publicCardRoutes);

apiRoutes.use(authenticate);
apiRoutes.get("/dashboard", dashboardController.get);
apiRoutes.use("/customers", customerRoutes);
apiRoutes.use("/vehicles", vehicleRoutes);
apiRoutes.use("/service-records", serviceRecordRoutes);
apiRoutes.use("/reminders", reminderRoutes);
