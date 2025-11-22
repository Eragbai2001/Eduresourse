import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  } else {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }
}

export async function GET() {
  try {
    const shouldLogTimings = process.env.NODE_ENV !== 'production';
    const logTiming = (label: string, start: number) => {
      if (!shouldLogTimings) return;
      try {
        const ms = Date.now() - start;
        // eslint-disable-next-line no-console
        console.log(`[prisma-timing] ${label} — ${ms}ms`);
      } catch (e) {
        /* ignore logging errors */
      }
    };

    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const queriesStart = Date.now();
    const [
      totalStudents,
      totalCourses,
      totalViews,
      enrollmentTrends,
      topRatedCourses,
      recentResources,
      recentRatings,
      learningActivity,
    ] = await Promise.all([
      prisma.profile.count({
        cacheStrategy: { ttl: 300, swr: 600 },
      }),

      prisma.resource.count({
        cacheStrategy: { ttl: 300, swr: 600 },
      }),

      prisma.resource.aggregate({
        _sum: { viewCount: true },
        cacheStrategy: { ttl: 60, swr: 120 },
      }),

      prisma.downloadReminder.groupBy({
        by: ["firstDownloadedAt"],
        _count: { id: true },
        where: { firstDownloadedAt: { gte: sevenMonthsAgo } },
        orderBy: { firstDownloadedAt: "asc" },
        cacheStrategy: { ttl: 3600, swr: 7200 },
      }),

      // ✅ FIXED: Get top-rated courses properly
      prisma.rating.findMany({
        orderBy: { score: "desc" },
        take: 3,
        select: {
          id: true,
          resourceId: true,
          score: true,
          createdAt: true,
        },
        cacheStrategy: { ttl: 600, swr: 1200 },
      }),

      prisma.resource.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          department: true,
          level: true,
          description: true,
          coverPhoto: true,
          coverColor: true,
          resourceCount: true,
          downloadCount: true,
          viewCount: true,
          createdAt: true,
        },
        cacheStrategy: { ttl: 120, swr: 240 },
      }),

      // ✅ FIXED: Get recent ratings without nested relations
      prisma.rating.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        cacheStrategy: { ttl: 120, swr: 240 },
      }),

      prisma.downloadReminder.groupBy({
        by: ["firstDownloadedAt"],
        _count: { id: true },
        where: { firstDownloadedAt: { gte: oneWeekAgo } },
        orderBy: { firstDownloadedAt: "asc" },
        cacheStrategy: { ttl: 300, swr: 600 },
      }),
    ]);
    logTiming('dashboard: initial parallel queries', queriesStart);

    // Process enrollment trends
    const monthlyEnrollments = (
      enrollmentTrends as Array<{
        firstDownloadedAt: Date;
        _count: { id: number };
      }>
    ).reduce((acc: Record<string, number>, item) => {
      const month = new Date(item.firstDownloadedAt).toLocaleString("default", {
        month: "short",
      });
      if (!acc[month]) acc[month] = 0;
      acc[month] += item._count.id;
      return acc;
    }, {});

    // ✅ Process top courses - fetch details separately
    const topCoursesStart = Date.now();
    const topCoursesResolved = await Promise.all(
      topRatedCourses.map(async (rating) => {
        const resource = await prisma.resource.findUnique({
          where: { id: rating.resourceId },
          select: {
            id: true,
            title: true,
            department: true,
            level: true,
            viewCount: true,
            downloadCount: true,
            coverPhoto: true,
            coverColor: true,
            resourceCount: true,
          },
        });

        if (!resource) return null;

        const ratingCount = await prisma.rating.count({
          where: { resourceId: rating.resourceId },
        });

        return {
          ...resource,
          averageRating: rating.score,
          ratingCount,
        };
      })
    );
    logTiming('dashboard: resolve top courses (per-resource lookups)', topCoursesStart);

    const topCourses = topCoursesResolved.filter(
      (c): c is NonNullable<typeof c> => c !== null
    );

    // Calculate weighted scores and percentages
    const totalWeightedScore = topCourses.reduce(
      (sum: number, course) => sum + course.averageRating * course.ratingCount,
      0
    );

    const mappedCourses = topCourses.map((course, index) => {
      const courseWeightedScore = course.averageRating * course.ratingCount;
      const percentage =
        totalWeightedScore > 0
          ? Math.round((courseWeightedScore / totalWeightedScore) * 100)
          : Math.round(100 / topCourses.length);

      return {
        ...course,
        rank: index + 1,
        percentage,
      };
    });

    // ✅ Process recent ratings - fetch profile and resource separately
    const ratingsStart = Date.now();
    const ratingsWithDetails = await Promise.all(
      recentRatings.map(async (rating) => {
        const profile = await prisma.profile.findFirst({
          where: { userId: rating.userId },
        });
        const resource = await prisma.resource.findUnique({
          where: { id: rating.resourceId },
        });
        return {
          ...rating,
          userName: profile?.fullName || profile?.username || "Anonymous",
          resourceTitle: resource?.title || "Unknown Resource",
        };
      })
    );
    logTiming('dashboard: enrich recent ratings (profile+resource lookups)', ratingsStart);

    // Process learning activity
    const activityByDayHour = (
      learningActivity as Array<{
        firstDownloadedAt: Date;
        _count: { id: number };
      }>
    ).reduce(
      (
        acc: Record<string, { day: string; hour: number; count: number }>,
        item
      ) => {
        const date = new Date(item.firstDownloadedAt);
        const day = date.toLocaleString("default", { weekday: "short" });
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        if (!acc[key]) acc[key] = { day, hour, count: 0 };
        acc[key].count += item._count.id;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCourses,
          totalEnrollments: totalStudents,
          totalViews: totalViews._sum.viewCount || 0,
        },
        enrollmentTrends: monthlyEnrollments,
        topCourses: mappedCourses,
        recentResources: recentResources.map((resource) => ({
          ...resource,
          timeAgo: getTimeAgo(resource.createdAt),
        })),
        recentFeedback: ratingsWithDetails,
        learningActivity: Object.values(activityByDayHour),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error ?? "Unknown error");
    console.error("Error fetching dashboard stats:", message, error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
