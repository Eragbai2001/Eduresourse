import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get total students (profiles)
    const totalStudents = await prisma.profile.count();

    // Get total courses/resources
    const totalCourses = await prisma.resource.count();

    // Get total enrollments (downloads)
    const totalEnrollments = await prisma.resource.aggregate({
      _sum: {
        downloadCount: true,
      },
    });

    // Get total views
    const totalViews = await prisma.resource.aggregate({
      _sum: {
        viewCount: true,
      },
    });

    // Get enrollment trends (last 7 months)
    const sevenMonthsAgo = new Date();
    sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);

    const enrollmentTrends = await prisma.downloadReminder.groupBy({
      by: ["firstDownloadedAt"],
      _count: {
        id: true,
      },
      where: {
        firstDownloadedAt: {
          gte: sevenMonthsAgo,
        },
      },
      orderBy: {
        firstDownloadedAt: "asc",
      },
    });

    // Group by month for enrollment trends
    const monthlyEnrollments = enrollmentTrends.reduce(
      (acc: Record<string, number>, item) => {
        const month = new Date(item.firstDownloadedAt).toLocaleString(
          "default",
          {
            month: "short",
          }
        );
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += item._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top courses (by views and downloads)
    const topCourses = await prisma.resource.findMany({
      orderBy: [{ viewCount: "desc" }, { downloadCount: "desc" }],
      take: 5,
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

    // Get recently uploaded resources
    const recentResources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc",
      },
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
    });

    // Get recent ratings/feedback
    const recentRatings = await prisma.rating.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Get ratings with user and resource details
    const ratingsWithDetails = await Promise.all(
      recentRatings.map(
        async (rating: {
          userId: string;
          resourceId: string;
          id: string;
          score: number;
          review: string | null;
          createdAt: Date;
          updatedAt: Date;
        }) => {
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
        }
      )
    );

    // Get learning activity (downloads per day for the last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const learningActivity = await prisma.downloadReminder.groupBy({
      by: ["firstDownloadedAt"],
      _count: {
        id: true,
      },
      where: {
        firstDownloadedAt: {
          gte: oneWeekAgo,
        },
      },
      orderBy: {
        firstDownloadedAt: "asc",
      },
    });

    // Group by day and hour
    const activityByDayHour = learningActivity.reduce(
      (
        acc: Record<string, { day: string; hour: number; count: number }>,
        item
      ) => {
        const date = new Date(item.firstDownloadedAt);
        const day = date.toLocaleString("default", { weekday: "short" });
        const hour = date.getHours();

        const key = `${day}-${hour}`;
        if (!acc[key]) {
          acc[key] = { day, hour, count: 0 };
        }
        acc[key].count += item._count.id;
        return acc;
      },
      {} as Record<string, { day: string; hour: number; count: number }>
    );

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCourses,
          totalEnrollments: totalEnrollments._sum.downloadCount || 0,
          totalViews: totalViews._sum.viewCount || 0,
        },
        enrollmentTrends: monthlyEnrollments,
        topCourses: topCourses.map(
          (course: (typeof topCourses)[0], index: number) => ({
            ...course,
            rank: index + 1,
            percentage:
              topCourses.length > 0
                ? Math.round(
                    (course.viewCount /
                      topCourses.reduce(
                        (sum: number, c: (typeof topCourses)[0]) =>
                          sum + c.viewCount,
                        0
                      )) *
                      100
                  )
                : 0,
          })
        ),
        recentResources: recentResources.map(
          (resource: (typeof recentResources)[0]) => ({
            ...resource,
            timeAgo: getTimeAgo(resource.createdAt),
          })
        ),
        recentFeedback: ratingsWithDetails,
        learningActivity: Object.values(activityByDayHour),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
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
