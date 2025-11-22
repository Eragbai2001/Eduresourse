// lib/prisma.ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"; // use '@prisma/client/edge' for edge runtime
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  const accelerateUrl = process.env.DATABASE_URL_ACCELERATE;
  const fallbackUrl = process.env.DATABASE_URL;
  const dbUrl = accelerateUrl ?? fallbackUrl;

  // If a DB URL is available, pass it explicitly to the client to ensure
  // the correct connection string is used. If not, let PrismaClient read
  // from the environment at runtime (avoids passing `undefined`).
  const client = dbUrl
    ? new PrismaClient({
        datasources: { db: { url: dbUrl } },
        // optional: log: ['query','info','warn','error'],
      })
    : new PrismaClient();

  // Only enable the Accelerate extension when an accelerate URL is configured.
  return accelerateUrl ? client.$extends(withAccelerate()) : client;
};

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
