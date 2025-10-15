"use client";
import SearchBar from "@/app/components/SearchBar";
import TabFilter from "@/app/components/TabFilter";
// Import your skeleton components
import React, { useEffect, useState } from "react";
import {
  CirclePlay,
  FileSpreadsheet,
  FileText,
  File,
  BookOpen,
  DownloadCloud,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SkeletonCourseCard,
  SkeletonCourseDetail,
} from "@/app/components/SkeletonCourse";
import toast, { Toaster } from "react-hot-toast";

// Function to get color based on course level
const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "#9FB9EB";
    case "Intermediate":
      return "#F588D6";
    case "Advanced":
      return "#F2BC33";
    default:
      return "#F588D6";
  }
};

export default function CoursesPage() {
  type CourseFile = string;

  interface Course {
    id: string;
    userId: string;
    department: string;
    level: string;
    title: string;
    description: string;
    features: string[];
    files: CourseFile[];
    coverPhoto: string | null;
    coverColor: string;
    resourceCount: number;
    downloadCount: number;
    status?: string;
    lessons?: number;
    hours?: number;
    enrolled?: number;
    createdAt: string;
  }
  interface Profile {
    user_id: string;
    display_name?: string | null;
    full_name?: string | null;
    avatar_url?: string | null; // may be a URL or a storage path
    email?: string | null;
  }

  // Loading states
  const [isCoursesLoading, setIsCoursesLoading] = useState(true);
  const [isSelectedCourseLoading, setIsSelectedCourseLoading] = useState(true);

  // Existing state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [activeDepartment, setActiveDepartment] = useState("All Departments");
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAll, setShowAll] = useState(false);
  // signedUrls prefetch removed to keep logic simple; signed URLs are generated on demand.
  const [uploader, setUploader] = useState<Profile | null>(null);
  const [uploaderAvatarUrl, setUploaderAvatarUrl] = useState<string | null>(
    null
  );
  const [isUploaderLoading, setIsUploaderLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Bookmarked courses with localStorage persistence
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(
    new Set()
  );
  // Ratings summary for display (average and count). We fetch a lightweight
  // aggregate when a course is selected so this page can show the current
  // rating without offering the rating form itself.
  const [rating, setRating] = useState<{
    average: number | null;
    count: number;
  }>({ average: null, count: 0 });

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Load bookmarked courses from database on mount
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch("/api/bookmarks");
        if (response.ok) {
          const data = await response.json();
          console.log("[Bookmark] Loaded from database:", data.bookmarks);
          setBookmarkedCourses(new Set(data.bookmarks));
        } else {
          console.error(
            "[Bookmark] Failed to fetch bookmarks:",
            response.status
          );
        }
      } catch (error) {
        console.error("[Bookmark] Error loading bookmarks:", error);
      }
    };

    fetchBookmarks();
  }, []);

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

  const searchParams = useSearchParams();
  const courseIdFromQuery = searchParams?.get("courseId");
  const router = useRouter();
  const { user } = useAuth();

  // Set active tab from URL query parameter
  useEffect(() => {
    const tabFromQuery = searchParams?.get("tab");
    if (tabFromQuery === "myuploads") {
      setActiveTab("My Uploads");
    }
  }, [searchParams]);

  // We intentionally do not prefetch signed URLs here to keep behavior simple and
  // to avoid extra storage calls. Signed URLs are created on demand when the
  // user clicks a resource link (see the button click handler below).

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
        // Call our server endpoint which returns profile (may include a
        // resolved avatarPublicUrl or a raw avatar_url). The endpoint is
        // responsible for resolving storage paths to public URLs when
        // available.
        const res = await fetch(`/api/profiles/${selectedCourse.userId}`);
        if (!res.ok) {
          let body = null;
          try {
            body = await res.json();
          } catch {
            body = await res.text();
          }
          console.error("Error fetching uploader profile:", body);
          return;
        }

        const payload = await res.json();

        // Check if payload is null or invalid
        if (!payload) {
          console.log("[DEBUG] Invalid or null payload received");
          setIsUploaderLoading(false);
          return;
        }

        console.log(
          "[DEBUG] Profile API Response for userId:",
          selectedCourse.userId
        );
        console.log("[DEBUG] Full payload:", payload);
        console.log(
          "[DEBUG] payload.avatarPublicUrl:",
          payload.avatarPublicUrl
        );
        console.log(
          "[DEBUG] profile.avatar_url:",
          payload?.profile?.avatar_url
        );

        const profile = payload?.profile ?? null;

        if (!profile) {
          console.log("[DEBUG] No profile found, returning");
          setIsUploaderLoading(false);
          return;
        }
        if (!mounted) return;

        setUploader(profile);

        // Prefer an already-resolved URL (avatarPublicUrl) from the payload root,
        // otherwise use avatar_url from the profile if it looks like an absolute URL.
        // If it's a storage path, we leave it to the server to have resolved it;
        // otherwise we won't try to construct it here to avoid guessing bucket names.
        const resolvedUrl =
          payload.avatarPublicUrl ||
          (profile.avatar_url &&
          profile.avatar_url.toString().startsWith("http")
            ? profile.avatar_url
            : null);

        console.log("[DEBUG] Final resolvedUrl:", resolvedUrl);
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

  // Fetch courses from API
  useEffect(() => {
    setIsCoursesLoading(true);
    fetch("/api/resources")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("[debug] /api/resources error response:", text);
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[debug] Fetched courses:", data);
        console.log("[debug] Number of courses:", data?.length);
        console.log("[debug] Is array:", Array.isArray(data));
        if (data && data.length > 0) {
          console.log("[debug] First course:", data[0]);
          console.log("[debug] First course createdAt:", data[0].createdAt);
        }
        // Received course list; update state
        setCourses(Array.isArray(data) ? data : []);
        setIsCoursesLoading(false);
      })
      .catch((err) => {
        console.error("[debug] /api/resources fetch error:", err);
        setIsCoursesLoading(false);
      });
  }, []);

  useEffect(() => {
    // If a courseId is provided in the query string, load that course's details.
    if (courseIdFromQuery) {
      // courseId provided in query; load that course
      setIsSelectedCourseLoading(true);
      fetch(`/api/resources/${courseIdFromQuery}`)
        .then(async (res) => {
          if (!res.ok) {
            console.error(
              `Failed to fetch resource ${courseIdFromQuery}: ${res.status}`
            );
            return null;
          }
          const body = await res.text();
          try {
            const json = JSON.parse(body || "null");
            return json;
          } catch {
            // non-JSON response
            return null;
          }
        })
        .then((data) => {
          // Only set the course if we have valid data
          if (data && data.id) {
            setSelectedCourse(data);
          } else {
            console.error("Invalid course data received:", data);
            setSelectedCourse(null);
          }
          setIsSelectedCourseLoading(false);
          // Fetch a lightweight aggregate (average + count) for display
          // on the dashboard page.
          if (data?.id) {
            fetch(`/api/ratings/${data.id}`)
              .then((r) => r.json())
              .then((d) =>
                setRating({ average: d.average ?? null, count: d.count ?? 0 })
              )
              .catch(() => setRating({ average: null, count: 0 }));
          } else {
            setRating({ average: null, count: 0 });
          }
        })
        .catch((err) => {
          console.error("[debug] /api/resources/<id> fetch error:", err);
          setIsSelectedCourseLoading(false);
        });
      return;
    }

    // Otherwise, if courses are loaded, pick the first one as before.
    if (courses.length > 0 && !isCoursesLoading) {
      setSelectedCourse(courses[0]);
      setIsSelectedCourseLoading(false);
    } else if (!isCoursesLoading && courses.length === 0) {
      setIsSelectedCourseLoading(false);
    }
  }, [courseIdFromQuery, courses, isCoursesLoading]);

  // If the user landed from an email link that includes a rating (e.g.
  // /dashboard/courses?courseId=<id>&rating=5) then submit that rating on
  // behalf of the signed-in user and refresh the lightweight aggregate shown
  // in the header. If the user is not signed in, send them to the login page
  // with a redirect that preserves the rating param so it can be submitted
  // after authentication.
  useEffect(() => {
    if (!selectedCourse?.id) return;
    const ratingParam = searchParams?.get("rating");
    if (!ratingParam) return;

    const parsed = parseInt(ratingParam, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) return;

    let cancelled = false;

    async function submitRatingFromQuery() {
      // If user isn't signed in, redirect to login and preserve redirect
      if (!user?.id) {
        const redirectTo = `/dashboard/courses?courseId=${
          selectedCourse!.id
        }&rating=${parsed}`;
        router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
        return;
      }

      try {
        const res = await fetch(`/api/ratings/${selectedCourse!.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: parsed, review: "" }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error("Failed to submit rating from email link:", body);
        } else {
          // Refresh aggregate and update header state
          try {
            const agg = await fetch(`/api/ratings/${selectedCourse!.id}`).then(
              (r) => r.json()
            );
            if (!cancelled)
              setRating({
                average: agg.average ?? null,
                count: agg.count ?? 0,
              });
          } catch (err) {
            console.error("Failed to refresh rating aggregate:", err);
          }
        }
      } catch (err) {
        console.error("submitRatingFromQuery error:", err);
      }

      // Remove the rating param from the URL so we don't resubmit on reload.
      // Keep the courseId in the query string.
      try {
        router.replace(`/dashboard/courses?courseId=${selectedCourse!.id}`);
      } catch {
        // Non-fatal
      }
    }

    submitRatingFromQuery();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse, searchParams, user, router]);

  // Filter courses based on active tab, department, and level
  const filteredCourses = courses
    .filter((course) => {
      if (activeTab === "All") return true;
      if (activeTab === "My Uploads") return course.userId === user?.id;
      const created = new Date(course.createdAt);
      const isRecent = created >= oneYearAgo;
      console.log(
        "[debug] Course:",
        course.title,
        "Created:",
        created,
        "IsRecent:",
        isRecent,
        "OneYearAgo:",
        oneYearAgo
      );
      if (activeTab === "Recent") return isRecent;
      if (activeTab === "Old") return !isRecent;
      return true;
    })
    .filter((course) =>
      activeLevel === "All Levels" ? true : course.level === activeLevel
    )
    .filter((course) =>
      activeDepartment === "All Departments"
        ? true
        : course.department === activeDepartment
    );

  console.log("[debug] Total courses:", courses.length);
  console.log("[debug] Filtered courses:", filteredCourses.length);
  console.log("[debug] Active tab:", activeTab);
  console.log("[debug] Active level:", activeLevel);
  console.log("[debug] Active department:", activeDepartment);

  // Clear selected course when filtered courses becomes empty
  useEffect(() => {
    if (!isCoursesLoading && filteredCourses.length === 0 && selectedCourse) {
      setSelectedCourse(null);
    }
  }, [filteredCourses.length, isCoursesLoading, selectedCourse]);

  function getCourseAgeLabel(course: Course) {
    const now = new Date();
    const created = new Date(course.createdAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    return created >= oneYearAgo ? "Recent" : "Old";
  }

  return (
    <div className="h-full w-full bg-[#F5F8FF] flex flex-col lg:flex-row lg:justify-between gap-4 font-hanken">
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

      {/* Left side - Courses list */}
      <div
        className={`bg-[#F5F8FF] mb-4 lg:mb-0 h-full ${
          filteredCourses.length === 0 && !isCoursesLoading
            ? "w-full"
            : "w-full"
        }`}>
        {/* Tab Filter Component */}
        <TabFilter
          tabs={["All", "Recent", "Old", "My Uploads"]}
          activeTab={activeTab}
          onTabChange={(newTab) => {
            setActiveTab(newTab);
            setShowAll(false); // Reset to show only 4 courses

            // Auto-select first course in the new filtered list after state updates
            setTimeout(() => {
              const filtered = courses
                .filter((course) => {
                  if (newTab === "All") return true;
                  if (newTab === "My Uploads")
                    return course.userId === user?.id;
                  const created = new Date(course.createdAt);
                  if (newTab === "Recent") return created >= oneYearAgo;
                  if (newTab === "Old") return created < oneYearAgo;
                  return true;
                })
                .filter((course) =>
                  activeLevel === "All Levels"
                    ? true
                    : course.level === activeLevel
                )
                .filter((course) =>
                  activeDepartment === "All Departments"
                    ? true
                    : course.department === activeDepartment
                );

              if (filtered.length > 0) {
                setSelectedCourse(filtered[0]);
                router.push(`/dashboard/courses?courseId=${filtered[0].id}`);
              } else {
                setSelectedCourse(null);
              }
            }, 0);
          }}
          departments={departments}
          levels={levels}
          activeDepartment={activeDepartment}
          activeLevel={activeLevel}
          onDepartmentChange={setActiveDepartment}
          onLevelChange={setActiveLevel}
          onSearchClick={() => setIsSearchOpen(true)}
          showSearch={true}
        />

        {/* Persistent info banner for "My Uploads" tab */}
        {activeTab === "My Uploads" && !isCoursesLoading && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-purple-900 mb-1">
                  Manage Your Uploads
                </h4>
                <p className="text-xs text-purple-700">
                  You can edit or update your uploaded resources anytime. Click
                  on any of your uploads to view details and make changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course list with skeleton loading */}
        <div className="space-y-8">
          {isCoursesLoading ? (
            // Show skeleton cards while loading
            [...Array(5)].map((_, index) => <SkeletonCourseCard key={index} />)
          ) : filteredCourses.length === 0 ? (
            // Show empty state when no courses match filters - centered full width
            <div className="flex items-center justify-center min-h-[60vh] w-full">
              <div className="bg-white rounded-xl p-12 text-center max-w-lg w-full mx-auto">
                <div className="flex flex-col items-center justify-center">
                  <BookOpen className="w-20 h-20 text-gray-300 mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                    {activeTab === "My Uploads"
                      ? "No Uploads Yet"
                      : "No Courses Available"}
                  </h3>
                  <p className="text-gray-500 text-base leading-relaxed mb-6">
                    {activeTab === "My Uploads"
                      ? "You haven't uploaded any resources yet. Share your knowledge with the community!"
                      : "There are no courses matching your current filters. Try adjusting your search criteria."}
                  </p>
                  {activeTab === "My Uploads" && (
                    <button
                      onClick={() => router.push("/dashboard/upload")}
                      className="bg-[#FFB0E8] hover:bg-[#FFB0E8]/90 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Upload Your First Resource
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Show actual courses - 2 on mobile, 4 on desktop
            (showAll
              ? filteredCourses
              : filteredCourses.slice(
                  0,
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? 2
                    : 4
                )
            ).map((course) => (
              <div
                key={course.id}
                className={`px-4 py-3 border rounded-xl cursor-pointer w-full relative ${
                  selectedCourse?.id === course.id
                    ? "border-2 border-[#FFB0E8] bg-white"
                    : "border-none hover:bg-gray-50 bg-white"
                }`}
                onClick={() => {
                  setSelectedCourse(course);
                  router.push(`/dashboard/courses?courseId=${course.id}`);
                }}>
                {/* Flex container for main content */}
                <div className="flex items-start w-full gap-2 md:gap-3">
                  <div
                    className="h-[87px] w-[87px] min-w-[87px] rounded-xl flex items-center justify-center"
                    style={{
                      background: !course.coverPhoto
                        ? course.coverColor
                        : undefined,
                      position: "relative",
                      overflow: "hidden",
                    }}>
                    {course.coverPhoto ? (
                      <Image
                        src={
                          supabase.storage
                            .from("cover-photos")
                            .getPublicUrl(course.coverPhoto).data.publicUrl
                        }
                        alt={course.title}
                        fill
                        className="object-cover "
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white select-none">
                        {(course.title || "TITLE").slice(0, 6).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow ml-2 md:ml-5 overflow-hidden">
                    {/* Category and level */}
                    <div className="flex text-sm items-center">
                      <span className="text-[#8D8F91] text-[12px]">
                        {course.department}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span
                        className="text-[12px]"
                        style={{ color: getLevelColor(course.level) }}>
                        {course.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-[#2E3135] text-[16px] md:text-[18px] pr-2 break-words">
                      {course.title}
                    </h3>

                    {/* Stats for desktop and tablet */}
                    <div className="hidden md:flex items-center text-xs text-gray-500 mt-4">
                      <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                        <BookOpen size={14} className="mr-1 text-gray-400" />
                        {course.resourceCount}
                        <span className="text-[#8D8F91] ml-1">resources</span>
                      </span>

                      <span className="flex items-center text-[#2E3135] font-semibold">
                        <DownloadCloud
                          size={14}
                          className="mr-1 text-gray-400"
                        />
                        {course.downloadCount}
                        <span className="text-[#8D8F91] ml-1">downloaded</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile stats in their own block below the main content */}
                <div className="md:hidden w-full flex items-center text-xs text-gray-500 mt-4 pt-3 pl-1 border-t-2 border-gray-100">
                  <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                    <BookOpen size={14} className="mr-1 text-gray-400" />
                    {course.resourceCount}
                    <span className="text-[#8D8F91] ml-1">resources</span>
                  </span>

                  <span className="flex items-center text-[#2E3135] font-semibold">
                    <DownloadCloud size={14} className="mr-1 text-gray-400" />
                    {course.downloadCount}
                    <span className="text-[#8D8F91] ml-1">downloaded</span>
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Show More/Less button */}
          {!isCoursesLoading && filteredCourses.length > 4 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors duration-200 flex items-center gap-2">
                {showAll ? (
                  <>
                    Show Less
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    Show More ({filteredCourses.length - 4} more)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Course description with skeleton loading - hide when no courses */}
      {(filteredCourses.length > 0 || isCoursesLoading) && (
        <div className="bg-white rounded-xl w-full lg:ml-auto h-fit p-4">
          {isSelectedCourseLoading || isCoursesLoading ? (
            <SkeletonCourseDetail />
          ) : selectedCourse ? (
            <div>
              <div className="mb-4">
                <div className="text-[17px] text-[#8D8F91] flex items-center">
                  {selectedCourse.department}
                  <span className="mx-2 text-gray-300 text-sm">•</span>
                  <span style={{ color: getLevelColor(selectedCourse.level) }}>
                    {selectedCourse.level}
                  </span>
                  <span className="text-xs text-gray-400 pl-3">
                    Created:{" "}
                    {new Date(selectedCourse.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2">
                  <h2 className="text-[22px] sm:text-[26px] font-bold">
                    {selectedCourse.title}
                  </h2>
                  <span className="text-xs min-w-[68px] w-fit px-3 h-[24px] rounded-full flex justify-center items-center text-[13px] sm:text-[14px] font-medium self-start sm:self-auto bg-[#FCF2F9] text-[#2E3135]">
                    <div className="w-[6px] h-[6px] flex items-center mr-1.5">
                      <Image
                        src="/courses/Color Indicator.png"
                        alt="status indicator"
                        width={6}
                        height={6}
                        className="object-cover"
                      />
                    </div>
                    {getCourseAgeLabel(selectedCourse)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-3 gap-3.5">
                  {/* Ratings are collected on the dedicated course page. Show a
                    simple placeholder here: if no rating is available, display
                    0.0 and 0 Reviews. */}
                  <span className="flex items-center mr-4">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2">
                      <path
                        d="M10 15.27L16.18 18l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 3.73L3.82 18z"
                        fill="#F6C244"
                      />
                    </svg>
                    <span className="font-semibold text-[#2E3135] text-lg">
                      {rating.average !== null
                        ? rating.average.toFixed(1)
                        : "0.0"}
                    </span>
                    <span className="text-[#8D8F91] font-normal ml-2">
                      ({(rating.count ?? 0).toLocaleString()}{" "}
                      {rating.count === 1 ? "Review" : "Reviews"})
                    </span>
                  </span>

                  <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                    <BookOpen size={14} className="mr-1 text-gray-400" />
                    {selectedCourse.resourceCount}{" "}
                    <span className="text-[#8D8F91] ml-1">resources</span>
                  </span>

                  <span className="flex items-center text-[#2E3135] font-semibold ">
                    <DownloadCloud size={14} className="mr-1 text-gray-400" />
                    {selectedCourse.downloadCount}{" "}
                    <span className="text-[#8D8F91] ml-1">downloaded</span>
                  </span>
                </div>
              </div>

              <div
                className="mb-4 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[340px] w-full rounded-md overflow-hidden relative flex items-center justify-center"
                style={{
                  // Always use the course cover color as the background for the
                  // selected-course header. We intentionally do NOT render the
                  // uploaded cover image here to prevent showing user-uploaded
                  // images in this view.
                  background: selectedCourse.coverColor,
                }}>
                <span className="text-5xl font-bold text-white select-none">
                  {(selectedCourse.title || "TITLE").slice(0, 6).toUpperCase()}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between mb-3">
                {/* Left side - Uploader info */}
                <div className="flex items-center space-x-3">
                  {(() => {
                    console.log(
                      "[DEBUG RENDER] isUploaderLoading:",
                      isUploaderLoading
                    );
                    console.log(
                      "[DEBUG RENDER] uploaderAvatarUrl:",
                      uploaderAvatarUrl
                    );
                    console.log("[DEBUG RENDER] uploader:", uploader);
                    return null;
                  })()}
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
                          width={40}
                          height={40}
                          className="rounded-full w-10 h-10 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#FFB0E8] text-white flex items-center justify-center font-semibold">
                          {(
                            (uploader?.display_name ??
                              uploader?.full_name ??
                              uploader?.email) ||
                            (selectedCourse?.userId ?? "U")
                          )
                            .toString()
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-[#2E3135]">
                          {uploader?.full_name ??
                            uploader?.display_name ??
                            uploader?.email ??
                            "Uploader"}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Right side - Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Edit button - only show for user's own courses */}
                  {selectedCourse?.userId === user?.id && (
                    <button
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/dashboard/courses/edit/${selectedCourse.id}`
                        );
                      }}
                      title="Edit this resource"
                      type="button">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Bookmark button - shows for all courses */}
                  <button
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      bookmarkedCourses.has(selectedCourse?.id || "")
                        ? "bg-gray-800 hover:bg-gray-900 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (selectedCourse) {
                        const isCurrentlyBookmarked = bookmarkedCourses.has(
                          selectedCourse.id
                        );

                        try {
                          if (isCurrentlyBookmarked) {
                            // Remove bookmark
                            const response = await fetch(
                              `/api/bookmarks/${selectedCourse.id}`,
                              { method: "DELETE" }
                            );
                            if (response.ok) {
                              setBookmarkedCourses((prev) => {
                                const newSet = new Set(prev);
                                newSet.delete(selectedCourse.id);
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
                              body: JSON.stringify({
                                resourceId: selectedCourse.id,
                              }),
                            });
                            if (response.ok) {
                              setBookmarkedCourses((prev) => {
                                const newSet = new Set(prev);
                                newSet.add(selectedCourse.id);
                                return newSet;
                              });
                              toast.success("Saved to Collection", {
                                icon: "�",
                              });
                            }
                          }
                        } catch (error) {
                          console.error(
                            "[Bookmark] Error toggling bookmark:",
                            error
                          );
                          toast.error("Failed to update bookmark");
                        }
                      }
                    }}
                    title={
                      bookmarkedCourses.has(selectedCourse?.id || "")
                        ? "Remove from collection"
                        : "Save to collection"
                    }
                    type="button">
                    <svg
                      className="w-5 h-5"
                      fill={
                        bookmarkedCourses.has(selectedCourse?.id || "")
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-1 text-[16px] text-[#2E3135]">
                  About Course
                </h3>
                <p className="text-[14px] text-[#797B7E]">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-1 text-[16px] text-[#2E3135]">
                  Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-2">
                  {(selectedCourse.features ?? []).map(
                    (feature: string, idx: number) => (
                      <div className="flex items-start" key={idx}>
                        <span className="text-pink-400 mr-2">✓</span>
                        <span className="text-sm text-[#797B7E]">
                          {feature}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3 text-[16px] text-[#2E3135]">
                  Resources
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-2">
                  {(selectedCourse?.files ?? []).map(
                    (filePath: string, index: number) => {
                      // Extract display name
                      const pathParts = filePath.split("/");
                      const fullFilename = pathParts[pathParts.length - 1];
                      const timestampMatch = fullFilename.match(/^\d+-(.+)$/);
                      const displayName = timestampMatch
                        ? timestampMatch[1]
                        : fullFilename;

                      // File type logic
                      const extension = displayName
                        .split(".")
                        .pop()
                        ?.toLowerCase();
                      const fileType =
                        extension === "mp4" ||
                        extension === "avi" ||
                        extension === "mov"
                          ? "video"
                          : extension === "pdf"
                          ? "pdf"
                          : extension === "xlsx" ||
                            extension === "xls" ||
                            extension === "csv"
                          ? "excel"
                          : "file";

                      return (
                        <div key={index} className="flex items-center">
                          <div className="w-[12px] h-[12px] mr-3 text-gray-400">
                            {fileType === "video" ? (
                              <CirclePlay
                                size={18}
                                className="text-[#797B7E]"
                              />
                            ) : fileType === "pdf" ? (
                              <FileText size={18} className="text-[#797B7E]" />
                            ) : fileType === "excel" ? (
                              <FileSpreadsheet
                                size={18}
                                className="text-[#797B7E]"
                              />
                            ) : (
                              <File size={18} className="text-[#797B7E]" />
                            )}
                          </div>

                          {/* Generate signed URL on click instead of prefetching */}
                          <button
                            onClick={async () => {
                              // Ensure path matches your bucket structure
                              const cleanPath = filePath.startsWith(
                                "resources/"
                              )
                                ? filePath
                                : `resources/${filePath}`;

                              const { data, error } = await supabase.storage
                                .from("resources")
                                .createSignedUrl(cleanPath, 60 * 60); // 1 hour expiry

                              if (error) {
                                console.error(
                                  "Error creating signed URL:",
                                  error
                                );
                                return;
                              }

                              // Increment download count and send rating email immediately
                              await fetch(
                                `/api/resources/${
                                  selectedCourse!.id
                                }/increment-download`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    userId: user?.id,
                                    sendRatingEmail: true, // Send email immediately
                                  }),
                                }
                              );

                              // Trigger download
                              const link = document.createElement("a");
                              link.href = data.signedUrl;
                              link.download = displayName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-sm text-[#9FB9EB] hover:underline cursor-pointer truncate text-left">
                            {displayName}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a course to view details
            </div>
          )}
        </div>
      )}

      {/* Search Modal for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-x-0 top-0 bg-white rounded-b-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-800 font-hanken">
                Search Resources
              </h2>
            </div>
            <SearchBar
              placeholder="Search for courses, materials..."
              className="w-full"
              focusRingColor="focus:ring-purple-200"
              onResultClick={() => setIsSearchOpen(false)}
            />
            <p className="text-xs text-gray-500 mt-3 text-center font-hanken">
              Type to search across all resources
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
