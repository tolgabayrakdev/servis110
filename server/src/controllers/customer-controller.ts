import type { Request, Response } from "express";
import { customerService } from "../services/customer-service.js";
import { getPagination } from "../utils/pagination.js";

export const customerController = {
  async list(request: Request, response: Response) {
    response.json(await customerService.list(request.user!.workshopId, getPagination(request.query), request.query.search as string | undefined));
  },

  async get(request: Request, response: Response) {
    response.json({ data: await customerService.get(request.params.id as string, request.user!.workshopId) });
  },

  async create(request: Request, response: Response) {
    response.status(201).json({ data: await customerService.create(request.user!.workshopId, request.body) });
  },

  async update(request: Request, response: Response) {
    response.json({ data: await customerService.update(request.params.id as string, request.user!.workshopId, request.body) });
  },

  async remove(request: Request, response: Response) {
    await customerService.remove(request.params.id as string, request.user!.workshopId);
    response.status(204).send();
  },
};
