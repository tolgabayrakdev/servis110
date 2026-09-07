import type { Request, Response } from "express";
import { serviceRecordService } from "../services/service-record-service.js";

export const serviceRecordController = {
  async list(request: Request, response: Response) {
    response.json({ data: await serviceRecordService.list(request.params.vehicleId as string, request.user!.workshopId) });
  },

  async get(request: Request, response: Response) {
    response.json({ data: await serviceRecordService.get(request.params.id as string, request.user!.workshopId) });
  },

  async create(request: Request, response: Response) {
    response.status(201).json({ data: await serviceRecordService.create(request.params.vehicleId as string, request.user!.workshopId, request.body) });
  },

  async update(request: Request, response: Response) {
    response.json({ data: await serviceRecordService.update(request.params.id as string, request.user!.workshopId, request.body) });
  },

  async remove(request: Request, response: Response) {
    await serviceRecordService.remove(request.params.id as string, request.user!.workshopId);
    response.status(204).send();
  },
};
