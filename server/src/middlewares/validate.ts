import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { errors } from "../errors/app-error.js";

type Schemas = { body?: ZodType; params?: ZodType; query?: ZodType };

export const validate = (schemas: Schemas): RequestHandler => (request, _response, next) => {
  for (const key of ["body", "params", "query"] as const) {
    const schema = schemas[key];
    if (!schema) continue;
    const result = schema.safeParse(request[key]);
    if (!result.success) return next(errors.badRequest("Gönderilen bilgiler geçersiz", result.error.flatten()));
    // Express 5 exposes `request.query` as a getter without a setter. Defining an
    // own property preserves the parsed/validated query for downstream handlers
    // without attempting to assign to the read-only prototype accessor.
    if (key === "query") {
      Object.defineProperty(request, "query", {
        configurable: true,
        enumerable: true,
        value: result.data,
        writable: true,
      });
    } else {
      (request as unknown as Record<string, unknown>)[key] = result.data;
    }
  }
  next();
};
