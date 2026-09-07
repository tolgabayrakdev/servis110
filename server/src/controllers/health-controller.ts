import type { Request, Response } from "express";
import { db } from "../config/database.js";

export const healthController = {
  async get(_request: Request, response: Response) {
    await db.raw("select 1");
    response.json({ data: { status: "ok", timestamp: new Date().toISOString() } });
  },
};
