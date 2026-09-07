import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { tokenService } from "../services/token-service.js";
import { errors } from "../errors/app-error.js";

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.headers.authorization;
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const token = request.cookies?.[env.AUTH_COOKIE_NAME] as string | undefined ?? bearerToken;
  if (!token) return next(errors.unauthorized());

  try {
    request.user = tokenService.verify(token);
    next();
  } catch {
    next(errors.unauthorized("Geçersiz veya süresi dolmuş oturum"));
  }
};
