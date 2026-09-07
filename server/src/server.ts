import { app } from "./app.js";
import { db } from "./config/database.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`Servis110 API http://localhost:${env.PORT}/api/v1 adresinde çalışıyor`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} alındı, sunucu kapatılıyor`);
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
