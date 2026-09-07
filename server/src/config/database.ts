import knex from "knex";
import { env } from "./env.js";

export const db = knex({
  client: "pg",
  connection: env.DATABASE_URL,
  pool: { min: env.NODE_ENV === "production" ? 2 : 0, max: 10 },
});
