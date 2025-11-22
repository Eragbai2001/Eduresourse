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
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // ✅ All queries in parallel WITHOUT cacheStrategy
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
      prisma.profile.count(),
      prisma.resource.count(),
      prisma.resource.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.downloadReminder.groupBy({
        by: ["firstDownloadedAt"],
        _count: { id: true },
        where: { firstDownloadedAt: { gte: sevenMonthsAgo } },
        orderBy: { firstDownloadedAt: "asc" },
      }),
      prisma.rating.findMany({
        orderBy: { score: "desc" },
        take: 3,
        select: {
          id: true,
          resourceId: true,
          score: true,
          createdAt: true,
        },
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
      }),
      prisma.rating.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.downloadReminder.groupBy({
        by: ["firstDownloadedAt"],
        _count: { id: true },
        where: { firstDownloadedAt: { gte: oneWeekAgo } },
        orderBy: { firstDownloadedAt: "asc" },
      }),
    ]);

    // ... rest of your processing code stays the same
    const monthlyEnrollments = enrollmentTrends.reduce(
      (acc: Record<string, number>, item) => {
        const month = new Date(item.firstDownloadedAt).toLocaleString("default", {
          month: "short",
        });
        if (!acc[month]) acc[month] = 0;
        acc[month] += item._count.id;
        return acc;
      },
      {}
    );

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

    const topCourses = topCoursesResolved.filter(
      (c): c is NonNullable<typeof c> => c !== null
    );

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

    const activityByDayHour = learningActivity.reduce(
      (acc: Record<string, { day: string; hour: number; count: number }>, item) => {
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
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}