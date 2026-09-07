import type { Request, Response } from "express";
import { authService } from "../services/auth-service.js";
import { authCookie } from "../utils/auth-cookie.js";

export const authController = {
  async register(request: Request, response: Response) {
    const { token, ...data } = await authService.register(request.body);
    authCookie.set(response, token);
    response.status(201).json({ data });
  },

  async login(request: Request, response: Response) {
    const { token, ...data } = await authService.login(request.body);
    authCookie.set(response, token);
    response.json({ data });
  },

  async me(request: Request, response: Response) {
    response.json({ data: await authService.me(request.user!.id, request.user!.workshopId) });
  },

  async logout(_request: Request, response: Response) {
    authCookie.clear(response);
    response.status(204).send();
  },
};
