import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard-service.js";

export const dashboardController = {
  async get(request: Request, response: Response) {
    response.json({ data: await dashboardService.get(request.user!.workshopId) });
  },
};
