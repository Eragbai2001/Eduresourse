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

    // ✅ OPTIMIZED: All queries in parallel with proper includes
    const [
      totalStudents,
      totalCourses,
      totalViews,
      enrollmentTrends,
      topRatedCoursesData,
      recentResources,
      recentRatingsData,
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
      // ✅ FIXED: Fetch top courses with ratings in ONE query using aggregation
      prisma.rating.groupBy({
        by: ["resourceId"],
        _avg: { score: true },
        _count: { id: true },
        orderBy: {
          _avg: { score: "desc" },
        },
        take: 3,
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
      // ✅ FIXED: Fetch recent ratings
      prisma.rating.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          userId: true,
          resourceId: true,
          score: true,
          review: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.downloadReminder.groupBy({
        by: ["firstDownloadedAt"],
        _count: { id: true },
        where: { firstDownloadedAt: { gte: oneWeekAgo } },
        orderBy: { firstDownloadedAt: "asc" },
      }),
    ]);

    // Process enrollment trends
    const monthlyEnrollments = enrollmentTrends.reduce(
      (acc: Record<string, number>, item) => {
        const month = new Date(item.firstDownloadedAt).toLocaleString(
          "default",
          { month: "short" }
        );
        if (!acc[month]) acc[month] = 0;
        acc[month] += item._count.id;
        return acc;
      },
      {}
    );

    // ✅ OPTIMIZED: Fetch all resources at once using IN clause
    const resourceIds = topRatedCoursesData.map((r) => r.resourceId);
    const resources = await prisma.resource.findMany({
      where: { id: { in: resourceIds } },
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

    // Create a map for quick lookup
    const resourceMap = new Map(resources.map((r) => [r.id, r]));

    // Combine the data
    const topCourses = topRatedCoursesData
      .map((rating) => {
        const resource = resourceMap.get(rating.resourceId);
        if (!resource) return null;

        return {
          ...resource,
          averageRating: rating._avg.score || 0,
          ratingCount: rating._count.id,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    // Calculate percentages
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

    // ✅ OPTIMIZED: Fetch related data in bulk
    const userIds = recentRatingsData.map((r) => r.userId);
    const ratingResourceIds = recentRatingsData.map((r) => r.resourceId);

    const [profiles, ratingResources] = await Promise.all([
      prisma.profile.findMany({
        where: { userId: { in: userIds } },
        select: {
          userId: true,
          fullName: true,
          username: true,
        },
      }),
      prisma.resource.findMany({
        where: { id: { in: ratingResourceIds } },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    // Create lookup maps
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const ratingResourceMap = new Map(ratingResources.map((r) => [r.id, r]));

    // Combine the data
    const ratingsWithDetails = recentRatingsData.map((rating) => {
      const profile = profileMap.get(rating.userId);
      const resource = ratingResourceMap.get(rating.resourceId);
      
      return {
        ...rating,
        userName: profile?.fullName || profile?.username || "Anonymous",
        resourceTitle: resource?.title || "Unknown Resource",
      };
    });

    // Process learning activity
    const activityByDayHour = learningActivity.reduce(
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

