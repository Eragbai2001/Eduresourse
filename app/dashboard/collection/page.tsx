"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});
  const [uploader, setUploader] = useState<Profile | null>(null);
  const [uploaderAvatarUrl, setUploaderAvatarUrl] = useState<string | null>(
    null
  );
  const [isUploaderLoading, setIsUploaderLoading] = useState(false);

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
    };

    fetchUploaderProfiles();
  }, [courses]);

  // Fetch uploader profile for selected course
  useEffect(() => {
    let mounted = true;
    async function fetchUploader() {
      setUploader(null);
      setUploaderAvatarUrl(null);
      setIsUploaderLoading(true);

      if (!selectedCourse?.userId) {
        setIsUploaderLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/profiles/${selectedCourse.userId}`);
        if (!res.ok) {
          console.error("Error fetching uploader profile:", res.status);
          setIsUploaderLoading(false);
          return;
        }

        const payload = await res.json();

        if (!payload) {
          console.log("[DEBUG] Invalid or null payload received");
          setIsUploaderLoading(false);
          return;
        }

        const profile = payload?.profile ?? null;

        if (!profile) {
          console.log("[DEBUG] No profile found, returning");
          setIsUploaderLoading(false);
          return;
        }

        if (!mounted) return;

        setUploader(profile);

        const resolvedUrl =
          payload.avatarPublicUrl ||
          (profile.avatar_url &&
          profile.avatar_url.toString().startsWith("http")
            ? profile.avatar_url
            : null);

        setUploaderAvatarUrl(resolvedUrl ?? null);
        setIsUploaderLoading(false);
      } catch (err) {
        console.error("fetchUploader error:", err);
        setIsUploaderLoading(false);
      }
    }

    fetchUploader();
    return () => {
      mounted = false;
    };
  }, [selectedCourse]);

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

  // Dynamic Doughnut chart data based on saved courses by department
  const categoryBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    savedCourses.forEach((course) => {
      const dept = course.department || "Other";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  }, [savedCourses]);

  const handleCardClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseDetail = () => {
    setSelectedCourse(null);
  };

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
                    {course.uploaderAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.uploaderAvatarUrl}
                        alt={
                          course.uploader?.full_name ??
                          course.uploader?.display_name ??
                          "Uploader"
                        }
                        className="rounded-full w-8 h-8 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#FFB0E8] text-white flex items-center justify-center text-xs font-semibold">
                        {(
                          (course.uploader?.display_name ??
                            course.uploader?.full_name ??
                            course.uploader?.email) ||
                          "U"
                        )
                          .toString()
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#2E3135] truncate">
                        {course.uploader?.full_name ??
                          course.uploader?.display_name ??
                          course.uploader?.email ??
                          "Uploader"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal - Similar to Courses Page */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleCloseDetail}>
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 font-hanken">
                  {selectedCourse.title}
                </h2>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className="w-full h-64 rounded-lg mb-4 flex items-center justify-center"
                style={{
                  background: selectedCourse.coverColor || "#FFB0E8",
                }}>
                <span className="text-5xl font-bold text-white select-none">
                  {(selectedCourse.title || "COURSE").slice(0, 6).toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 font-hanken mb-4">
                {selectedCourse.description}
              </p>

              {/* Action Buttons - Bookmark and Edit */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isUploaderLoading ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      <div className="w-32 h-4 rounded bg-gray-200 animate-pulse" />
                    </>
                  ) : (
                    <>
                      {uploaderAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={uploaderAvatarUrl}
                          alt={
                            uploader?.full_name ??
                            uploader?.display_name ??
                            "Uploader"
                          }
                          className="rounded-full w-10 h-10 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FFB0E8] text-white flex items-center justify-center text-xs font-semibold">
                          {(
                            (uploader?.display_name ??
                              uploader?.full_name ??
                              uploader?.email) ||
                            "U"
                          )
                            .toString()
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-hanken">
                          {uploader?.full_name ??
                            uploader?.display_name ??
                            uploader?.email ??
                            "Uploader"}
                        </p>
                        <p className="text-xs text-gray-500 font-hanken">
                          Educator
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(selectedCourse.id);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedCourses.has(selectedCourse.id)
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill={
                        bookmarkedCourses.has(selectedCourse.id)
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  {/* Edit Button - Only for user's courses */}
                  {selectedCourse.userId === user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/courses/edit/${selectedCourse.id}`
                        );
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 font-hanken mb-2">
                  Course Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-hanken">Category</p>
                    <p className="text-gray-900 font-hanken">
                      {selectedCourse.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-hanken">Level</p>
                    <p className="text-gray-900 font-hanken">
                      {selectedCourse.level}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-hanken">Duration</p>
                    <p className="text-gray-900 font-hanken">
                      {selectedCourse.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-hanken">Hours</p>
                    <p className="text-gray-900 font-hanken">
                      {selectedCourse.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
