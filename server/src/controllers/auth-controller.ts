import type { Request, Response } from "express";
import { authService } from "../services/auth-service.js";
import { authCookie } from "../utils/auth-cookie.js";

export const authController = {
  async register(request: Request, response: Response) {
    response.status(201).json({ data: await authService.register(request.body) });
  },

  async verifyEmail(request: Request, response: Response) {
    const { token, ...data } = await authService.verifyEmail(
      request.body.email,
      request.body.code,
    );
    authCookie.set(response, token);
    response.json({ data });
  },

  async resendVerificationCode(request: Request, response: Response) {
    await authService.resendVerificationCode(request.body.email);
    response.json({
      data: { message: "Hesap doğrulanmamışsa yeni kod gönderildi." },
    });
  },

  async login(request: Request, response: Response) {
    const { token, ...data } = await authService.login(request.body);
    authCookie.set(response, token);
    response.json({ data });
  },

  async forgotPassword(request: Request, response: Response) {
    await authService.forgotPassword(request.body.email);
    response.json({
      data: {
        message:
          "Bu e-posta ile kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi.",
      },
    });
  },

  async resetPassword(request: Request, response: Response) {
    await authService.resetPassword(request.body.token, request.body.newPassword);
    response.status(204).send();
  },

  async me(request: Request, response: Response) {
    response.json({
      data: await authService.me(request.user!.id, request.user!.workshopId),
    });
  },

  async logout(_request: Request, response: Response) {
    authCookie.clear(response);
    response.status(204).send();
  },

  async updateAccount(request: Request, response: Response) {
    response.json({
      data: await authService.updateAccount(
        request.user!.id,
        request.user!.workshopId,
        request.body,
      ),
    });
  },

  async changePassword(request: Request, response: Response) {
    await authService.changePassword(
      request.user!.id,
      request.user!.workshopId,
      request.body,
    );
    response.status(204).send();
  },

  async deleteAccount(request: Request, response: Response) {
    await authService.deleteAccount(
      request.user!.id,
      request.user!.workshopId,
      request.body.password,
    );
    authCookie.clear(response);
    response.status(204).send();
  },
};
