import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkRatings() {
  try {
    console.log("Fetching top rated courses...\n");

    const ratings = await prisma.rating.groupBy({
      by: ["resourceId"],
      _avg: { score: true },
      _count: { id: true },
      orderBy: [{ _avg: { score: "desc" } }, { _count: { id: "desc" } }],
      take: 3,
    });

    console.log("Top Rated Courses (aggregated):");
    console.log(JSON.stringify(ratings, null, 2));

    console.log("\n\nDetailed Course Information:");

    for (const rating of ratings) {
      const resource = await prisma.resource.findUnique({
        where: { id: rating.resourceId },
        select: { title: true, id: true, department: true, level: true },
      });

      const allRatings = await prisma.rating.findMany({
        where: { resourceId: rating.resourceId },
        select: { score: true, review: true },
      });

      console.log("\n----------------------------");
      console.log(`Course: ${resource?.title || "Unknown"}`);
      console.log(`ID: ${resource?.id}`);
      console.log(`Department: ${resource?.department}`);
      console.log(`Level: ${resource?.level}`);
      console.log(`Average Rating: ${rating._avg.score}`);
      console.log(`Number of Reviews: ${rating._count.id}`);
      console.log(
        `Individual Scores: [${allRatings.map((r) => r.score).join(", ")}]`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRatings();
