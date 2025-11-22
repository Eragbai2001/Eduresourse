// lib/prisma.ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client' // use '@prisma/client/edge' for edge runtime
import { withAccelerate } from '@prisma/extension-accelerate'

const createPrismaClient = () =>
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_ACCELERATE } },
    // optional: log: ['query','info','warn','error'],
  }).$extends(withAccelerate())

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma