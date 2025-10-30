"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  hours: string;
  students: string;
  price: string;
  coverImage: string;
  coverColor: string;
  userId: string;
  department: string;
  resourceCount: number;
  downloadCount: number;
  createdAt?: string;
}

interface Profile {
  user_id: string;
  display_name?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}

interface CourseWithUploader extends Course {
  uploader?: Profile;
  uploaderAvatarUrl?: string;
}

export function RecentCoursesSection() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithUploader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCourses = async () => {
      try {
        const response = await fetch("/api/resources");
        if (response.ok) {
          const data: Course[] = await response.json();

          // Get the 3 most recent courses
          const recentCourses = data.slice(0, 3);

          // Fetch uploader profiles for these courses
          const coursesWithData = await Promise.all(
            recentCourses.map(async (course) => {
              try {
                const res = await fetch(`/api/profiles/${course.userId}`);
                if (res.ok) {
                  const payload = await res.json();
                  const profile = payload?.profile ?? null;
                  const avatarUrl =
                    payload.avatarPublicUrl ||
                    (profile?.avatar_url &&
                    profile.avatar_url.toString().startsWith("http")
                      ? profile.avatar_url
                      : null);

                  return {
                    ...course,
                    uploader: profile,
                    uploaderAvatarUrl: avatarUrl,
                  };
                }
              } catch (error) {
                console.error(
                  `Error fetching profile for ${course.userId}:`,
                  error
                );
              }
              return { ...course, uploader: null, uploaderAvatarUrl: null };
            })
          );

          setCourses(coursesWithData);
        }
      } catch (error) {
        console.error("Error fetching recent courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCourses();
  }, []);

  const handleCardClick = (course: Course) => {
    router.push(`/dashboard/courses?courseId=${course.id}`);
  };

  if (loading) {
    return (
      <div className=" bg-white p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-hanken">
            New Courses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-white animate-pulse">
              {/* Cover skeleton - match real card height */}
              <div className="relative h-36 w-full bg-gray-200" />

              {/* Content skeleton - match real card padding */}
              <div className="p-3">
                <div className="h-3 bg-gray-200 rounded mb-2 w-24" />
                <div className="h-5 bg-gray-200 rounded mb-2 w-full" />

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200" />
                  <div className="h-3 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-2xl max-h-[340px] min-h-[220px] overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-hanken">
          New Courses
        </h2>
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="text-[#535559] font-medium text-sm font-hanken transition-colors">
          This Week →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCardClick(course)}
            className="bg-white rounded-lg overflow-hidden cursor-pointer transition-shadow duration-300">
            {/* Course Cover */}
            <div
              className="relative h-36 w-full rounded-lg overflow-hidden flex items-center justify-center"
              style={{
                background: course.coverColor || "#FFB0E8",
              }}>
              <span className="text-2xl font-bold text-white select-none">
                {(course.title || "COURSE").slice(0, 6).toUpperCase()}
              </span>
              <span className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-xs font-medium font-hanken text-gray-700">
                {course.level}
              </span>
            </div>

            {/* Course Content */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-500 font-hanken">
                  {course.department || course.category}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    {course.resourceCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {course.downloadCount || 0}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 font-hanken mb-2 line-clamp-2 text-base">
                {course.title}
              </h3>

              {/* Uploader Info */}
              <div className="flex items-center gap-2 mb-3">
                {!course.uploader ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="w-20 h-3 rounded bg-gray-200 animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    {course.uploaderAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.uploaderAvatarUrl}
                        alt={
                          course.uploader.full_name ??
                          course.uploader.display_name ??
                          course.uploader.email ??
                          ""
                        }
                        className="rounded-full w-7 h-7 object-cover"
                        loading="eager"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#FFB0E8] text-white flex items-center justify-center text-xs font-semibold">
                        {(
                          course.uploader.display_name ??
                          course.uploader.full_name ??
                          course.uploader.email ??
                          ""
                        )
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate font-hanken">
                        {course.uploader.full_name ??
                          course.uploader.display_name ??
                          course.uploader.email}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
