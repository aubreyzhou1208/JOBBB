import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

declare global {
  var __prisma__: PrismaClient | undefined;
}

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = global.__prisma__ ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}
