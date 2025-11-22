// file: find-orphaned-ratings.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function findOrphanedRatings() {
  const allRatings = await prisma.rating.findMany();
  const allResourceIds = new Set(
    (await prisma.resource.findMany({ select: { id: true } })).map(r => r.id)
  );

  const orphanedRatings = allRatings.filter(rating => !allResourceIds.has(rating.resourceId));

  console.log('Orphaned Ratings:', orphanedRatings);
  console.log(`Total orphaned ratings: ${orphanedRatings.length}`);

  await prisma.$disconnect();
}

findOrphanedRatings();