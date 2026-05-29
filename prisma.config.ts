// @ts-ignore — Prisma 7 config file
import { defineConfig, env } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrate: {
    async adapter() {
      const pool = new Pool({
        connectionString: env("DATABASE_URL"),
      });
      return new PrismaPg(pool);
    },
  },
});
