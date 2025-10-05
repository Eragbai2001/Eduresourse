"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalViews: number;
  };
  enrollmentTrends: Record<string, number>;
  topCourses: Array<{
    id: string;
    title: string;
    department: string;
    level: string;
    viewCount: number;
    downloadCount: number;
    rank: number;
    percentage: number;
  }>;
  recentResources: Array<{
    id: string;
    title: string;
    department: string;
    timeAgo: string;
  }>;
  recentFeedback: Array<{
    id: string;
    userName: string;
    resourceTitle: string;
    score: number;
    review: string | null;
    createdAt: Date;
  }>;
  learningActivity: Array<{ day: string; hour: number; count: number }>;
}

export default function DashboardStatsExample() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB0E8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Hello, welcome back!</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.overview.totalStudents.toLocaleString()}
          icon="👨‍🎓"
          bgColor="bg-pink-100"
          textColor="text-pink-600"
        />
        <StatCard
          title="Total Courses"
          value={stats.overview.totalCourses.toLocaleString()}
          icon="📚"
          bgColor="bg-blue-100"
          textColor="text-blue-600"
        />
        <StatCard
          title="Total Enrollments"
          value={stats.overview.totalEnrollments.toLocaleString()}
          icon="✅"
          bgColor="bg-yellow-100"
          textColor="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enrollment Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Enrollment Trends
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.enrollmentTrends).map(([month, count]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{month}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#FFB0E8] h-3 rounded-full"
                      style={{
                        width: `${Math.min(
                          (count /
                            Math.max(
                              ...Object.values(stats.enrollmentTrends)
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-900 font-semibold min-w-[3rem] text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Courses</h2>
          <div className="space-y-4">
            {stats.topCourses.slice(0, 5).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {course.department} • Level {course.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#FFB0E8]">
                    {course.percentage}%
                  </p>
                  <p className="text-xs text-gray-600">
                    {course.viewCount} students
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Resources (Past Questions) */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          New Past Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.recentResources.slice(0, 3).map((resource) => (
            <div
              key={resource.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-2">
                {resource.department}
              </span>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-500">{resource.timeAgo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      {stats.recentFeedback.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Recent Feedback
          </h2>
          <div className="space-y-4">
            {stats.recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="border-l-4 border-[#FFB0E8] pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {feedback.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      rated &ldquo;{feedback.resourceTitle}&rdquo;
                    </p>
                    {feedback.review && (
                      <p className="text-sm text-gray-700 mt-1 italic">
                        &ldquo;{feedback.review}&rdquo;
                      </p>
                    )}
                  </div>
                  <div className="flex">
                    {Array.from({ length: feedback.score }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
}: {
  title: string;
  value: string;
  icon: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
