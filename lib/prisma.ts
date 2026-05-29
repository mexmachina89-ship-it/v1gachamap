import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let _prisma: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && !dbUrl.startsWith("file:")) {
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const { Pool } = require("pg");
      const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }, // Required for Supabase
      });
      _prisma = new PrismaClient({ adapter: new PrismaPg(pool) } as any);
    } catch {
      _prisma = new PrismaClient();
    }
  } else {
    _prisma = new PrismaClient();
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = _prisma;
  }

  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as any)[prop];
  },
});
