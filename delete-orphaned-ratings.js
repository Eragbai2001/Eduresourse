import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deleteOrphanedRatings() {
  const allRatings = await prisma.rating.findMany();
  const allResourceIds = new Set(
    (await prisma.resource.findMany({ select: { id: true } })).map(r => r.id)
  );

  const orphanedRatings = allRatings.filter(rating => !allResourceIds.has(rating.resourceId));

  if (orphanedRatings.length === 0) {
    console.log('No orphaned ratings found.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Deleting ${orphanedRatings.length} orphaned ratings...`);
  for (const rating of orphanedRatings) {
    await prisma.rating.delete({ where: { id: rating.id } });
    console.log(`Deleted rating with id: ${rating.id}`);
  }

  console.log('All orphaned ratings deleted.');
  await prisma.$disconnect();
}

deleteOrphanedRatings();
