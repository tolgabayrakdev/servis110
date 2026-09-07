import type { Request, Response } from "express";
import { publicCardService } from "../services/public-card-service.js";

export const publicCardController = {
  async get(request: Request, response: Response) {
    response.json({ data: await publicCardService.get(request.params.token as string) });
  },
};
