import type { Request, Response } from "express";
import { reminderService } from "../services/reminder-service.js";

export const reminderController = {
  async list(request: Request, response: Response) {
    response.json({ data: await reminderService.list(request.params.vehicleId as string, request.user!.workshopId) });
  },
  async create(request: Request, response: Response) {
    response.status(201).json({ data: await reminderService.create(request.params.vehicleId as string, request.user!.workshopId, request.body) });
  },
  async updateStatus(request: Request, response: Response) {
    response.json({ data: await reminderService.updateStatus(request.params.id as string, request.user!.workshopId, request.body.status) });
  },
  async remove(request: Request, response: Response) {
    await reminderService.remove(request.params.id as string, request.user!.workshopId);
    response.status(204).send();
  },
};
