"use client";
import CustomDropdown from "@/app/components/CustomDropdown";
// Import your skeleton components
import React, { useEffect, useState } from "react";
import {
  CirclePlay,
  FileSpreadsheet,
  FileText,
  Search,
  File,
  BookOpen,
  DownloadCloud,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import {
  SkeletonCourseCard,
  SkeletonCourseDetail,
} from "@/app/components/SkeletonCourse";

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [uploader, setUploader] = useState<Profile | null>(null);
  const [uploaderAvatarUrl, setUploaderAvatarUrl] = useState<string | null>(
    null
  );

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

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

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function fetchSignedUrls() {
      setSignedUrls([]); // reset while loading
      if (!selectedCourse?.files || selectedCourse.files.length === 0) return;

      const results = await Promise.allSettled(
        selectedCourse.files.map(async (filePath: string) => {
          try {
            const cleanPath = filePath.replace(/^resources\//, "");
            console.log("DB path:", filePath, " → Clean path:", cleanPath);

            const { data: publicData } = supabase.storage
              .from("resources")
              .getPublicUrl(cleanPath);

            if (publicData?.publicUrl) return publicData.publicUrl;

            // fallback for private buckets
            const { data, error } = await supabase.storage
              .from("resources")
              .createSignedUrl(cleanPath, 60 * 60);

            if (error) {
              console.error("createSignedUrl error", {
                filePath,
                cleanPath,
                error,
              });
              return "";
            }

            return data?.signedUrl || "";
          } catch (err) {
            console.error("signed url generation error", { filePath, err });
            return "";
          }
        })
      );

      // Debugging block — runs once per fetchSignedUrls call
      console.log("📝 Debugging file paths...");
      if (selectedCourse && selectedCourse.files) {
        selectedCourse.files.forEach((filePath: string) => {
          console.log("Raw DB path:", filePath);

          const { data: pub } = supabase.storage
            .from("resources")
            .getPublicUrl(filePath);
          console.log("Generated public URL:", pub?.publicUrl);

          // also try createSignedUrl and log result (non-blocking)
          supabase.storage
            .from("resources")
            .createSignedUrl(filePath, 60)
            .then((res) => {
              console.log(
                "Generated signed URL:",
                res.data?.signedUrl,
                "Error:",
                res.error
              );
            })
            .catch((e) => {
              console.error("createSignedUrl (debug) error", { filePath, e });
            });
        });
      }

      if (!mounted) return;
      const urls = results.map((r) =>
        r.status === "fulfilled" ? (r.value as string) : ""
      );
      setSignedUrls(urls);
    }

    fetchSignedUrls();
    return () => {
      mounted = false;
    };
  }, [selectedCourse]);

  useEffect(() => {
    let mounted = true;
    async function fetchUploader() {
      setUploader(null);
      setUploaderAvatarUrl(null);

      if (!selectedCourse?.userId) return;

      try {
        // Call our server endpoint which returns profile + resolved avatarPublicUrl
        const res = await fetch(`/api/profiles/${selectedCourse.userId}`);
        if (!res.ok) {
          let body = null;
          try {
            body = await res.json();
          } catch (e) {
            body = await res.text();
          }
          console.error("Error fetching uploader profile:", body);
          return;
        }

        const payload = await res.json();
        const profile = payload?.profile ?? null;
        const avatarPublicUrl = payload?.avatarPublicUrl ?? null;

        if (!profile) return;
        if (!mounted) return;
        setUploader(profile);
        if (avatarPublicUrl) setUploaderAvatarUrl(avatarPublicUrl);
      } catch (e) {
        console.error("fetchUploader error:", e);
      }
    }

    fetchUploader();
    return () => {
      mounted = false;
    };
  }, [selectedCourse]);

  const mobileDropdownRef = React.useRef<HTMLDivElement>(null);
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedOutsideMobile =
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node);

      const clickedOutsideDesktop =
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node);

      if (clickedOutsideMobile && clickedOutsideDesktop) {
        setMobileFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch courses from API
  useEffect(() => {
    setIsCoursesLoading(true);
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setIsCoursesLoading(false);
      })
      .catch(() => {
        setIsCoursesLoading(false);
      });
  }, []);

  useEffect(() => {
    if (params?.id) {
      setIsSelectedCourseLoading(true);
      fetch(`/api/resources/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setSelectedCourse(data);
          setIsSelectedCourseLoading(false);
        })
        .catch(() => {
          setIsSelectedCourseLoading(false);
        });
    } else if (courses.length > 0 && !isCoursesLoading) {
      // When courses are loaded and no specific course ID, select first course
      setSelectedCourse(courses[0]);
      setIsSelectedCourseLoading(false);
    } else if (!isCoursesLoading && courses.length === 0) {
      // No courses available
      setIsSelectedCourseLoading(false);
    }
  }, [params?.id, courses, isCoursesLoading]);

  // Filter courses based on active tab, department, and level
  const filteredCourses = courses
    .filter((course) => {
      if (activeTab === "All") return true;
      const created = new Date(course.createdAt);
      if (activeTab === "Recent") return created >= oneYearAgo;
      if (activeTab === "Old") return created < oneYearAgo;
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

  function getCourseAgeLabel(course: Course) {
    const now = new Date();
    const created = new Date(course.createdAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    return created >= oneYearAgo ? "Recent" : "Old";
  }

  return (
    <div className="h-full w-full bg-[#F5F8FF] flex flex-col lg:flex-row lg:justify-between gap-4 font-hanken">
      {/* Left side - Courses list */}
      <div className="bg-[#F5F8FF] w-full mb-4 lg:mb-0 h-full">
        {/* Simple tab filter */}
        <div className="flex items-center justify-between mb-6">
          {/* Tab filters */}
          <div className="bg-white rounded-xl flex h-10">
            {["All", "Recent", "Old"].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-3 lg:px-4 rounded-xl text-sm font-medium ${
                  activeTab === tab
                    ? "bg-[#CDDEFF] text-[#2E3135]"
                    : "text-[#797B7E] hover:bg-white/50"
                }`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Desktop: Category dropdown, Mobile: Search and Menu icons */}
          <div className="flex items-center space-x-2">
            {/* Search icon for mobile */}
            <div className="block md:hidden">
              <button
                className="bg-white w-10 h-10 flex items-center justify-center rounded-lg"
                aria-label="Search courses">
                <Search size={20} stroke="#2E3135" strokeWidth={1.5} />
              </button>
            </div>

            {/* Menu icon for mobile */}
            <div className="block md:hidden">
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  className="bg-[#CDDEFF] w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
                  <Image
                    src="/courses/filter.png"
                    alt="Filter"
                    width={24}
                    height={24}
                  />
                </button>

                {mobileFiltersOpen && (
                  <div
                    className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64 space-y-3"
                    onClick={(e) => e.stopPropagation()}>
                    <CustomDropdown
                      options={departments}
                      defaultOption={activeDepartment}
                      onChange={setActiveDepartment}
                    />
                    <CustomDropdown
                      options={levels}
                      defaultOption={activeLevel}
                      onChange={setActiveLevel}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown for desktop */}
            <div className="hidden md:block">
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  className="bg-[#CDDEFF] w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
                  <Image
                    src="/courses/filter.png"
                    alt="Filter"
                    width={24}
                    height={24}
                  />
                </button>

                {mobileFiltersOpen && (
                  <div
                    className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64 space-y-3"
                    onClick={(e) => e.stopPropagation()}>
                    <CustomDropdown
                      options={departments}
                      defaultOption={activeDepartment}
                      onChange={setActiveDepartment}
                    />
                    <CustomDropdown
                      options={levels}
                      defaultOption={activeLevel}
                      onChange={setActiveLevel}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course list with skeleton loading */}
        <div className="space-y-8">
          {isCoursesLoading
            ? // Show skeleton cards while loading
              [...Array(5)].map((_, index) => (
                <SkeletonCourseCard key={index} />
              ))
            : // Show actual courses
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className={`px-4 py-3 border rounded-xl cursor-pointer w-full ${
                    selectedCourse?.id === course.id
                      ? "border-2 border-[#FFB0E8] bg-white"
                      : "border-none hover:bg-gray-50 bg-white"
                  }`}
                  onClick={() => {
                    setSelectedCourse(course);
                    router.push(`/dashboard/courses?courseId=${course.id}`);
                  }}>
                  {/* Flex container for main content */}
                  <div className="flex items-start w-full gap-2">
                    <div
                      className="h-[87px] w-[87px] rounded-xl flex items-center justify-center"
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
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white select-none">
                          {(course.title || "TITLE").slice(0, 6).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow ml-5">
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
                      <h3 className="font-semibold text-[#2E3135] text-[18px]">
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
                          <span className="text-[#8D8F91] ml-1">
                            downloaded
                          </span>
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
              ))}
        </div>
      </div>

      {/* Right side - Course description with skeleton loading */}
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
                {/* Rating and reviews */}
                <span className="flex items-center mr-4">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1">
                    <path
                      d="M10 15.27L16.18 18l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 3.73L3.82 18z"
                      fill="#F6C244"
                    />
                  </svg>
                  <span className="font-semibold text-[#2E3135]">4.8</span>
                  <span className="text-[#797B7E] font-normal ml-1">
                    (1,250 Reviews)
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
                background: !selectedCourse.coverPhoto
                  ? selectedCourse.coverColor
                  : undefined,
              }}>
              {selectedCourse.coverPhoto ? (
                <Image
                  src={
                    supabase.storage
                      .from("cover-photos")
                      .getPublicUrl(selectedCourse.coverPhoto).data.publicUrl
                  }
                  alt={`${selectedCourse.title} cover image`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <span className="text-5xl font-bold text-white select-none">
                  {(selectedCourse.title || "TITLE").slice(0, 6).toUpperCase()}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center space-x-3 mb-3 ">
              {uploaderAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploaderAvatarUrl}
                  alt={
                    uploader?.full_name ?? uploader?.display_name ?? "Uploader"
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
                      <span className="text-sm text-[#797B7E]">{feature}</span>
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
                            <CirclePlay size={18} className="text-[#797B7E]" />
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
                            const cleanPath = filePath.startsWith("resources/")
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

                            // Increment download count
                            await fetch(
                              `/api/resources/${selectedCourse.id}/increment-download`,
                              { method: "POST" }
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
    </div>
  );
}
