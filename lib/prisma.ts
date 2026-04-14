import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createPgPoolConfig } from "./pg-pool-config";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg(createPgPoolConfig()),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
