"use client";
// Add missing state and ref for dropdown popover
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import CustomDropdown from "./CustomDropdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const COLORS = ["#CDDEFF", "#FFB0E8", "#FFD365"];

const DEPARTMENTS = [
  "All Departments",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Business Administration",
  "Economics",
  "Psychology",
  "Literature",
];

const LEVELS = [
  "All Levels",
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
];

interface Course {
  id: string;
  title: string;
  department: string;
  level: string;
  resourceCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  percentage: number;
  rank: number;
}

interface CourseDataItem {
  name: string;
  value: number;
  lessons: number;
  students: number;
  rating: number;
  color: string;
  department: string;
  level: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

type TooltipPayload = { payload: { name: string }; value: number };

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs">
        <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-gray-600">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ data }: { data: CourseDataItem[] }) => {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 pr-3">
      {data.map((course, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className="w-4 h-8 lg:h-10 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: course.color }}
          />
          <div className="flex flex-col  flex-1">
            <p className="font-medium text-gray-900 text-[14px] lg:text-[15px] mb-1">
              {course.name}
            </p>
            <div className="flex gap-x-3 gap-y-1 text-[12px] lg:text-[13px] text-gray-600 ">
              <span className="font-semibold">{course.value}%</span>
              <span className=" flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 15.27L16.18 18l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 3.73L3.82 18z"
                    fill="#F6C244"
                  />
                </svg>
                {course.rating.toFixed(1)}
              </span>
              <span className="whitespace-nowrap">
                {course.lessons} Resources
              </span>
              <span className="  whitespace-nowrap ">
                {course.students.toLocaleString()} Reviews
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function TopCourses() {
  const [allCourses, setAllCourses] = useState<CourseDataItem[]>([]);
  const [courseData, setCourseData] = useState<CourseDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] = useState(DEPARTMENTS[0]);
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTopCourses() {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();

        if (data.success && data.data?.topCourses) {
          const courses: CourseDataItem[] = data.data.topCourses.map(
            (course: Course, index: number) => ({
              name: course.title,
              value: course.percentage,
              lessons: course.resourceCount,
              students: course.ratingCount,
              rating: course.averageRating || 0,
              department: course.department,
              level: course.level,
              color: COLORS[index % COLORS.length],
            })
          );
          setAllCourses(courses);
          setCourseData(courses);
        }
      } catch (error) {
        console.error("Error fetching top courses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopCourses();
  }, []);

  // Filter and sort courses based on dropdown selection
    useEffect(() => {
      let filtered = [...allCourses];
      if (selectedDepartment !== "All Departments") {
        filtered = filtered.filter((c) => c.department === selectedDepartment);
      }
      if (selectedLevel !== "All Levels") {
        filtered = filtered.filter((c) => c.level === selectedLevel);
      }
      setCourseData(filtered);
    }, [allCourses, selectedDepartment, selectedLevel]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // Allow card to grow based on content, no strict height limits
    <Card className="bg-white border-none shadow-none rounded-2xl h-fit min-h-[220px] max-h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-6">
        <CardTitle className="text-[15px] font-semibold text-gray-800">
          Top Courses
        </CardTitle>
        <div className="flex gap-2 items-center">
          <div className="relative" ref={dropdownRef}>
            <button
              className=" flex px-4 py-2 rounded-lg text-xs font-medium bg-white text-gray-700  hover:bg-gray-50 transition-colors duration-150 cursor-pointer "
              onClick={() => setIsDropdownOpen((open) => !open)}>
              Sort by
               <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Department
                  </label>
                  <CustomDropdown
                    options={DEPARTMENTS}
                    defaultOption={selectedDepartment}
                    onChange={setSelectedDepartment}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Level
                  </label>
                  <CustomDropdown
                    options={LEVELS}
                    defaultOption={selectedLevel}
                    onChange={setSelectedLevel}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className=" pb-6 sm:px-6 ">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 h-[320px] sm:h-[300px] ">
          {/* Donut chart */}
          <div className="w-full lg:w-[45%] flex justify-center flex-shrink-0">
            <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
                </div>
              ) : courseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      paddingAngle={3}
                      dataKey="value"
                      cornerRadius={10}>
                      {courseData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No rated courses yet
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="w-full lg:flex-1">
            {courseData.length > 0 ? (
              <CustomLegend data={courseData} />
            ) : (
              <div className="text-center text-gray-500 text-sm">
                {isLoading ? "Loading..." : "No course data available"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
