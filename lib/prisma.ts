import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Lazy initialization — only create the client when first accessed
let _prisma: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (_prisma) return _prisma;

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const { Pool } = require("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      _prisma = new PrismaClient({ adapter } as any);
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

// Export a proxy that lazily initializes on first property access
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrismaClient() as any)[prop];
  },
});
