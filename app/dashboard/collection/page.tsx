"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import TabFilter from "@/app/components/TabFilter";
import { SkeletonCollectionCard } from "@/app/components/SkeletonCollectionCard";
import toast, { Toaster } from "react-hot-toast";
import { Bookmark } from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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
  rating?: number; // Add rating property
}

export default function CollectionPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"All" | "Recent" | "Saved">(
    "All"
  );
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [activeDepartment, setActiveDepartment] = useState("All Departments");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesWithUploaders, setCoursesWithUploaders] = useState<
    CourseWithUploader[]
  >([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});
  const [isUploadersLoading, setIsUploadersLoading] = useState(false);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/resources");
        if (response.ok) {
          const data = await response.json();
          console.log("[Collection] Fetched courses:", data.length, "courses");
          console.log("[Collection] First course ID:", data[0]?.id);
          setCourses(data);
        } else {
          console.error(
            "[Collection] Failed to fetch courses:",
            response.status
          );
        }
      } catch (error) {
        console.error("[Collection] Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Load bookmarked courses from database on mount
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch("/api/bookmarks");
        if (response.ok) {
          const data = await response.json();
          console.log("[Collection] Loaded from database:", data.bookmarks);
          setBookmarkedCourses(new Set(data.bookmarks));
        } else {
          console.error(
            "[Collection] Failed to fetch bookmarks:",
            response.status
          );
        }
      } catch (error) {
        console.error("[Collection] Error loading bookmarks:", error);
      } finally {
        setBookmarksLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // Fetch uploader profiles for all courses
  useEffect(() => {
    if (courses.length === 0) return;

    const fetchUploaderProfiles = async () => {
      setIsUploadersLoading(true);
      const coursesWithData = await Promise.all(
        courses.map(async (course) => {
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
      setCoursesWithUploaders(coursesWithData);
      setIsUploadersLoading(false);
    };

    fetchUploaderProfiles();
  }, [courses]);

  // Get unique departments and levels
  const departments = React.useMemo(
    () => [
      "All Departments",
      ...(Array.isArray(courses)
        ? Array.from(new Set(courses.map((c) => c.department)))
        : []),
    ],
    [courses]
  );

  const levels = React.useMemo(
    () => ["All Levels", ...Array.from(new Set(courses.map((c) => c.level)))],
    [courses]
  );

  // Filter bookmarked courses and merge ratings
  const savedCourses = React.useMemo((): CourseWithUploader[] => {
    const sourceData =
      coursesWithUploaders.length > 0 ? coursesWithUploaders : courses;
    const filtered = sourceData
      .filter((course) => bookmarkedCourses.has(course.id))
      .filter((course) =>
        activeLevel === "All Levels" ? true : course.level === activeLevel
      )
      .filter((course) =>
        activeDepartment === "All Departments"
          ? true
          : course.department === activeDepartment
      )
      .map((course) => ({
        ...course,
        rating: ratingsMap[course.id] ?? 0,
      }));
    return filtered;
  }, [
    courses,
    coursesWithUploaders,
    bookmarkedCourses,
    activeLevel,
    activeDepartment,
    ratingsMap,
  ]);
  // Fetch ratings for all saved courses
  useEffect(() => {
    const fetchRatingsForCourses = async () => {
      if (!bookmarkedCourses || bookmarkedCourses.size === 0) return;
      const ids = Array.from(bookmarkedCourses);
      console.log("[Collection] Fetching ratings for:", ids);
      // Fetch ratings in parallel
      const ratings: Record<string, number> = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`/api/ratings/${id}`);
            if (res.ok) {
              const data = await res.json();
              console.log("[Collection] Rating for", id, ":", data);
              // Assume API returns { average: number }
              ratings[id] = typeof data.average === "number" ? data.average : 0;
            }
          } catch (e) {
            console.error("[Collection] Error fetching rating for", id, e);
            ratings[id] = 0;
          }
        })
      );
      console.log("[Collection] All ratings fetched:", ratings);
      setRatingsMap(ratings);
    };
    fetchRatingsForCourses();
  }, [bookmarkedCourses]);

  const handleCardClick = (course: Course) => {
    router.push(`/dashboard/courses?courseId=${course.id}`);
  };

  // Note: handleBookmarkToggle is kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBookmarkToggle = async (courseId: string) => {
    const isCurrentlyBookmarked = bookmarkedCourses.has(courseId);

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks/${courseId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setBookmarkedCourses((prev) => {
            const newSet = new Set(prev);
            newSet.delete(courseId);
            return newSet;
          });
          toast.success("Removed from Collection", {
            icon: "🗑️",
          });
        }
      } else {
        // Add bookmark
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: courseId }),
        });
        if (response.ok) {
          setBookmarkedCourses((prev) => {
            const newSet = new Set(prev);
            newSet.add(courseId);
            return newSet;
          });
          toast.success("Saved to Collection", {
            icon: "�",
          });
        }
      }
    } catch (error) {
      console.error("[Collection] Error toggling bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  if (loading || bookmarksLoading) {
    return (
      <div className="bg-[#FAFAFA] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCollectionCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
            padding: "16px",
            borderRadius: "10px",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* 🧠 ENHANCED DASHBOARD SECTION
          - Dynamic course count based on savedCourses.length
          - Time range selector (This Month / All Time) 
          - Trend indicator showing +/- percentage with color coding
          - Top Web Dev courses with ratings, review counts, and animated bars
          - Hover effects and smooth transitions for better UX
          - All using Tailwind + Hanken font for consistency
      */}
      {/* Upper Section - Dashboard Stats */}

      {/* Quick Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-hanken">Total Saved</p>
              <p className="text-3xl font-bold text-gray-900 font-hanken mt-2">
                {stats.totalSaved}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-hanken">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 font-hanken mt-2">
                {stats.downloads}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-hanken">
                Recently Added
              </p>
              <p className="text-3xl font-bold text-gray-900 font-hanken mt-2">
                {stats.recentlyAdded}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div> */}

      {/* Lower Section - Course Grid */}
      <div className="bg-[#FAFAFA] rounded-lg p-6">
        {/* Tab Filter Component */}
        <TabFilter
          tabs={["All", "Recent", "Saved"]}
          activeTab={selectedTab}
          onTabChange={(tab) =>
            setSelectedTab(tab as "All" | "Recent" | "Saved")
          }
          departments={departments}
          levels={levels}
          activeDepartment={activeDepartment}
          activeLevel={activeLevel}
          onDepartmentChange={setActiveDepartment}
          onLevelChange={setActiveLevel}
          showSearch={false}
        />

        {/* Course Grid */}
        {savedCourses.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 font-hanken mb-2">
              No saved resources yet
            </h3>
            <p className="text-gray-600 font-hanken">
              Start bookmarking courses from the Courses page to see them here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCardClick(course)}
                className="bg-white rounded-lg  overflow-hidden cursor-pointer">
                {/* Course Cover with Text */}
                <div
                  className="relative h-48 w-full rounded-lg overflow-hidden flex items-center justify-center"
                  style={{
                    background: course.coverColor || "#FFB0E8",
                  }}>
                  <span className="text-3xl font-bold text-white select-none">
                    {(course.title || "COURSE").slice(0, 6).toUpperCase()}
                  </span>
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white rounded-full text-xs font-medium font-hanken text-gray-700">
                    {course.level}
                  </span>
                </div>

                {/* Course Content */}
                <div className="p-4  ">
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
                  <h3 className="font-semibold text-gray-900 font-hanken mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    {isUploadersLoading || !course.uploader ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="w-24 h-3 rounded bg-gray-200 animate-pulse" />
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
                            className="rounded-full w-8 h-8 object-cover"
                            loading="eager"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#FFB0E8] text-white flex items-center justify-center text-xs font-semibold">
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
                          <div className="text-sm font-semibold  truncate">
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
        )}
      </div>
    </div>
  );
}
