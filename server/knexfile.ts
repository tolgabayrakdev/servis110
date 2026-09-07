import type { Knex } from "knex";
import "dotenv/config";

const connection = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/servis110";

const config: Record<string, Knex.Config> = {
  development: {
    client: "pg",
    connection,
    migrations: { directory: "./database/migrations", extension: "ts" },
    seeds: { directory: "./database/seeds", extension: "ts" },
  },
  production: {
    client: "pg",
    connection,
    pool: { min: 2, max: 10 },
    migrations: { directory: "./database/migrations", extension: "ts" },
    seeds: { directory: "./database/seeds", extension: "ts" },
  },
};

export default config;
