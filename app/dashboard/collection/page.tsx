"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Bookmark, Download, Clock } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import BarChart from "@/app/components/BarChart";
import TabFilter from "@/app/components/TabFilter";
import toast, { Toaster } from "react-hot-toast";

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

export default function CollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"All" | "Recent" | "Saved">(
    "All"
  );
  const [activeLevel, setActiveLevel] = useState("All Levels");
  const [activeDepartment, setActiveDepartment] = useState("All Departments");
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(
    new Set()
  );
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Load bookmarked courses from localStorage on mount
  useEffect(() => {
    console.log("[Collection] localStorage useEffect RUNNING!");
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bookmarkedCourses");
      console.log("[Collection] Loading from localStorage:", stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log("[Collection] Parsed bookmarks:", parsed);
          setBookmarkedCourses(new Set(parsed));
        } catch (error) {
          console.error(
            "[Collection] Error parsing bookmarked courses:",
            error
          );
        }
      } else {
        console.log("[Collection] No bookmarks found in localStorage");
      }
    }
  }, []);

  // Save bookmarked courses to localStorage whenever it changes
  useEffect(() => {
    const bookmarkArray = Array.from(bookmarkedCourses);
    localStorage.setItem("bookmarkedCourses", JSON.stringify(bookmarkArray));
    console.log("[Collection] Saved to localStorage:", bookmarkArray);
  }, [bookmarkedCourses]);

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

  // Filter bookmarked courses - use useMemo to ensure proper recalculation
  const savedCourses = React.useMemo(() => {
    const filtered = courses
      .filter((course) => bookmarkedCourses.has(course.id))
      .filter((course) =>
        activeLevel === "All Levels" ? true : course.level === activeLevel
      )
      .filter((course) =>
        activeDepartment === "All Departments"
          ? true
          : course.department === activeDepartment
      );

    console.log("[Collection] Total courses:", courses.length);
    console.log(
      "[Collection] Bookmarked course IDs:",
      Array.from(bookmarkedCourses)
    );
    console.log("[Collection] Filtered saved courses:", filtered.length);
    console.log("[Collection] Active level:", activeLevel);
    console.log("[Collection] Active department:", activeDepartment);

    return filtered;
  }, [courses, bookmarkedCourses, activeLevel, activeDepartment]);

  // Stats data
  const stats = {
    totalSaved: savedCourses.length,
    downloads: 0, // Will be from API later
    recentlyAdded: savedCourses.filter((c) => {
      // Mock: courses added in last 7 days
      return true;
    }).length,
  };

  // Doughnut chart data
  const doughnutData = {
    labels: ["Design", "Marketing", "Web Dev", "Business"],
    datasets: [
      {
        label: "Courses",
        data: [100, 50, 100, 50],
        backgroundColor: ["#FFB0E8", "#E8F0FF", "#CDDEFF", "#FFD365"],
        hoverOffset: 4,
      },
    ],
  };

  // Rating distribution - mock data
  const ratingData = [
    { rating: "4.7", category: "Design", count: 12 },
    { rating: "4.8", category: "Marketing", count: 15 },
    { rating: "4.6", category: "Web Dev", count: 8 },
    { rating: "4.8", category: "Business", count: 10 },
  ];

  const maxRatingCount = Math.max(...ratingData.map((d) => d.count));

  // Top saved courses - mock
  const topSavedCourses = [
    { title: "Python for Beginners", rating: 4.8, reviews: "1,400 Reviews" },
    { title: "JavaScript Essentials", rating: 4.7, reviews: "1,100 Reviews" },
    {
      title: "Full Stack Web Development",
      rating: 4.6,
      reviews: "952 Reviews",
    },
  ];

  const handleCardClick = (course: Course) => {
    setSelectedCourse(course);
  };

  const handleCloseDetail = () => {
    setSelectedCourse(null);
  };

  const handleBookmarkToggle = (courseId: string) => {
    const isCurrentlyBookmarked = bookmarkedCourses.has(courseId);

    setBookmarkedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });

    // Show toast notification
    if (isCurrentlyBookmarked) {
      toast.success("Removed from Collection", {
        icon: "🗑️",
      });
    } else {
      toast.success("Saved to Collection", {
        icon: "📚",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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

      {/* Upper Section - Dashboard Stats */}
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left: Courses by Category */}
        <div className="bg-white rounded-lg p-6 min-h-[290px]  min-[1550px]:h-[290px] flex flex-col">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="font-hanken font-semibold text-gray-900">
              Courses by Category
            </h3>
            <select className="text-sm text-gray-600 border-none focus:outline-none cursor-pointer">
              <option>This Week</option>
            </select>
          </div>

          {savedCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bookmark className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No saved courses yet</p>
            </div>
          ) : (
            <div className="flex flex-col min-[1550px]:flex-row min-[1550px]:items-center gap-3 min-[1550px]:gap-6 flex-1 justify-end min-[1550px]:justify-start">
              {/* Doughnut Chart using Chart.js */}
              <div className="relative flex-shrink-0 w-full min-[1550px]:w-auto flex justify-center min-[1550px]:justify-start">
                <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[200px] lg:h-[200px] min-[1550px]:w-[200px] min-[1550px]:h-[200px]">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
                {/* Total in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-gray-500 font-hanken">
                    Total Course
                  </span>
                  <span className="text-2xl font-bold text-gray-900 font-hanken">
                    250
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-3 min-[1550px]:space-y-4 min-w-0 flex flex-col justify-end min-[1550px]:justify-center">
                {doughnutData.labels?.map((label, index) => {
                  const count = Number(doughnutData.datasets[0].data[index]);
                  const total = doughnutData.datasets[0].data.reduce(
                    (a, b) => Number(a) + Number(b),
                    0
                  );
                  const percentage = ((count / total) * 100).toFixed(0);
                  const color = doughnutData.datasets[0].backgroundColor[index];

                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700 font-hanken truncate">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-gray-500 font-hanken whitespace-nowrap">
                          {count} Courses
                        </span>
                        <span className="text-sm font-semibold text-gray-900 font-hanken min-w-[40px] text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Middle & Right: Combined Section */}
        <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2  gap-5 xl:h-[290px]  ">
          {/* Course Rating */}
          <div className="bg-white rounded-lg p-6 min-h-[290px] ">
            <BarChart />
          </div>

          {/* Web Development Details */}
          <div className="bg-white rounded-lg p-6 xl:h-[290px]">
            <h2 className="font-hanken font-bold text-gray-800 mb-6">
              Web Development Details
            </h2>

            <div className="space-y-6">
              {topSavedCourses.map((course, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-hanken font-medium">
                      {course.title}
                    </h3>
                    <span className="text-gray-600 text-sm font-hanken flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      {course.rating} ({course.reviews})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(course.rating / 5) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-purple-600 font-hanken">
                      Saved
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(course.id);
                      }}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
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
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Uploader"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 font-hanken">
                      Uploader Name
                    </p>
                    <p className="text-xs text-gray-500 font-hanken">
                      Professor
                    </p>
                  </div>
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
