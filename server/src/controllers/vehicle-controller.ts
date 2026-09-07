import type { Request, Response } from "express";
import { vehicleService } from "../services/vehicle-service.js";
import { getPagination } from "../utils/pagination.js";

export const vehicleController = {
  async list(request: Request, response: Response) {
    response.json(await vehicleService.list(request.user!.workshopId, getPagination(request.query), request.query.search as string | undefined));
  },

  async findByPlate(request: Request, response: Response) {
    response.json({ data: await vehicleService.findByPlate(request.query.plate as string, request.user!.workshopId) });
  },

  async get(request: Request, response: Response) {
    response.json({ data: await vehicleService.get(request.params.id as string, request.user!.workshopId) });
  },

  async create(request: Request, response: Response) {
    response.status(201).json({ data: await vehicleService.create(request.user!.workshopId, request.body) });
  },

  async update(request: Request, response: Response) {
    response.json({ data: await vehicleService.update(request.params.id as string, request.user!.workshopId, request.body) });
  },

  async remove(request: Request, response: Response) {
    await vehicleService.remove(request.params.id as string, request.user!.workshopId);
    response.status(204).send();
  },
};
