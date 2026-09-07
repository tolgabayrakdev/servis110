import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({ error: { code: "ROUTE_NOT_FOUND", message: `${request.method} ${request.path} bulunamadı` } });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, details: error.details } });
    return;
  }
  if (error?.code === "23505") {
    response.status(409).json({ error: { code: "CONFLICT", message: "Bu kayıt zaten mevcut" } });
    return;
  }
  console.error(error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Beklenmeyen bir hata oluştu",
      ...(env.NODE_ENV === "development" && { details: error instanceof Error ? error.message : error }),
    },
  });
};
