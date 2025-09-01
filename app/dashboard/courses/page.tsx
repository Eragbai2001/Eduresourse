"use client";
import CustomDropdown from "@/app/components/CustomDropdown";
import React, { useState } from "react";
import {
  CircleDot,
  CirclePlay,
  Clock,
  FileSpreadsheet,
  FileText,
  Users,
  Search,
} from "lucide-react";
import Image from "next/image";

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

// Sample course data - this would typically come from an API
// Update your courses data with a coverImage field
const courses = [
  {
    id: 1,
    title: "Introduction to Programming",
    department: "Computer Science",
    level: "100 Level",
    status: "Active",
    lessons: 18,
    hours: 30,
    enrolled: 280,
    price: 0,
    courseCode: "COS101",
    image: "/courses/programming.png",
    coverImage: "/courses/programming-cover.png",
    description:
      "Foundational programming concepts, algorithms, and problem-solving techniques. Covers basic syntax, data types, control structures, and introductory data structures.",
    features: [
      "Hands-on coding exercises & practical examples",
      "Step-by-step algorithm development",
      "Data structure implementation practice",
      "Problem-solving techniques for beginners",
      "Interactive coding challenges & assessments",
    ],
    resources: [
      { name: "Introduction to Programming Basics.mp4", type: "video" },
      { name: "Algorithms and Flowcharts.mp4", type: "video" },
      { name: "Practical Data Structures.mp4", type: "video" },
      { name: "Course Syllabus.pdf", type: "pdf" },
      { name: "Programming Examples.pdf", type: "pdf" },
      { name: "Practice Problem Set.pdf", type: "pdf" },
    ],
  },
  {
    id: 2,
    title: "Calculus and Analytical Geometry",
    department: "Mathematics",
    level: "100 Level",
    status: "Active",
    lessons: 20,
    hours: 40,
    enrolled: 320,
    price: 0,
    courseCode: "MTH101",
    image: "/courses/math.png",
    coverImage: "/courses/math-cover.png",
    description:
      "Introduction to differential and integral calculus. Topics include limits, derivatives, applications of differentiation, integration techniques, and applications of integrals.",
    features: [
      "Step-by-step problem solving tutorials",
      "Comprehensive formula sheets & examples",
      "Visual representations of mathematical concepts",
      "Real-world calculus applications",
      "Practice problems with detailed solutions",
    ],
    resources: [
      { name: "Limits and Continuity.mp4", type: "video" },
      { name: "Differentiation Techniques.mp4", type: "video" },
      { name: "Integration Methods.mp4", type: "video" },
      { name: "Calculus Formula Sheet.pdf", type: "pdf" },
      { name: "Practice Problem Sets.xlsx", type: "excel" },
      { name: "Applied Calculus Examples.pdf", type: "pdf" },
    ],
  },
  {
    id: 3,
    title: "Total Man Concept",
    department: "General Studies",
    level: "200 Level",
    status: "Active",
    lessons: 12,
    hours: 24,
    enrolled: 450,
    price: 0,
    courseCode: "TMC201",
    image: "/courses/tmc.png",
    coverImage: "/courses/tmc-cover.png",
    description:
      "Holistic development course focusing on intellectual, physical, spiritual, and social dimensions. Emphasizes character formation, leadership skills, and societal values.",
    features: [
      "Character development frameworks & assessments",
      "Leadership skill building exercises",
      "Personal growth & development plans",
      "Ethical decision-making scenarios",
      "Community engagement opportunities",
    ],
    resources: [
      { name: "Introduction to Total Man Concept.mp4", type: "video" },
      { name: "Leadership in Modern Society.mp4", type: "video" },
      { name: "Character Formation Principles.mp4", type: "video" },
      { name: "Course Handbook.pdf", type: "pdf" },
      { name: "Self-Assessment Worksheets.xlsx", type: "excel" },
      { name: "Community Development Guide.pdf", type: "pdf" },
    ],
  },
  {
    id: 4,
    title: "Object-Oriented Programming with Java",
    department: "Computer Science",
    level: "200 Level",
    status: "Draft",
    lessons: 25,
    hours: 50,
    enrolled: 350,
    price: 0,
    courseCode: "COS201",
    image: "/courses/java.png",
    coverImage: "/courses/java-cover.png",
    description:
      "Core concepts of object-oriented programming using Java. Topics include classes, objects, inheritance, polymorphism, encapsulation, and interface implementation.",
    features: [
      "Hands-on Java programming exercises",
      "Object-oriented design patterns",
      "Real-world application development",
      "Code review & optimization techniques",
      "Java project portfolio building",
    ],
    resources: [
      { name: "Java OOP Fundamentals.mp4", type: "video" },
      { name: "Classes and Objects Deep Dive.mp4", type: "video" },
      { name: "Inheritance and Polymorphism.mp4", type: "video" },
      { name: "Java Style Guide.pdf", type: "pdf" },
      { name: "Code Examples.pdf", type: "pdf" },
      { name: "Practice Projects.pdf", type: "pdf" },
    ],
  },
  {
    id: 5,
    title: "Entrepreneurial Development Studies",
    department: "Business",
    level: "300 Level",
    status: "Active",
    lessons: 15,
    hours: 30,
    enrolled: 380,
    price: 0,
    courseCode: "EDS301",
    image: "/courses/entrepreneurship.png",
    coverImage: "/courses/entrepreneurship-cover.png",
    description:
      "Practical approach to entrepreneurship development, business creation, opportunity identification, business planning, and venture capital acquisition.",
    features: [
      "Business plan development workshops",
      "Market research & analysis techniques",
      "Financial modeling & projections",
      "Pitch deck creation guidelines",
      "Networking & funding acquisition strategies",
    ],
    resources: [
      { name: "Introduction to Entrepreneurship.mp4", type: "video" },
      { name: "Business Model Canvas Tutorial.mp4", type: "video" },
      { name: "Pitching to Investors.mp4", type: "video" },
      { name: "Business Plan Template.pdf", type: "pdf" },
      { name: "Financial Projection Models.xlsx", type: "excel" },
      { name: "Market Research Case Studies.pdf", type: "pdf" },
    ],
  },
];

export default function CoursesPage() {
  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState(courses[2]); // Default to Business Analytics course
  const [activeTab, setActiveTab] = useState("All");
  const [activeLevel, setActiveLevel] = useState("100 Level"); // Default level filter
  const [activeDepartment, setActiveDepartment] = useState("All Departments"); // Default department filter
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Refs for dropdown containers
  const mobileDropdownRef = React.useRef<HTMLDivElement>(null);
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);

  // Effect to handle click outside dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if click is outside both dropdowns
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

  // Filter courses based on active tab, department, and level
  const filteredCourses = courses
    .filter((course) =>
      activeTab === "All" ? true : course.status === activeTab
    )
    .filter((course) =>
      activeLevel === "All Levels" ? true : course.level === activeLevel
    )
    .filter((course) =>
      activeDepartment === "All Departments"
        ? true
        : course.department === activeDepartment
    );

  return (
    <div className="h-full w-full bg-[#F5F8FF] flex flex-col lg:flex-row lg:justify-between gap-4 font-hanken">
      {/* Left side - Courses list */}
      <div className="bg-[#F5F8FF]   w-full  mb-4 lg:mb-0 h-full ">
        {/* Simple tab filter */}

        <div className="flex items-center justify-between mb-6">
          {/* Tab filters */}
          <div className="bg-white rounded-xl flex h-10">
            {["All", "Recent", "Old"].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-3 lg:px-4 rounded-xl text-sm font-medium ${
                  (activeTab === "Active" && tab === "Recent") ||
                  (activeTab === "Draft" && tab === "Old") ||
                  activeTab === tab
                    ? "bg-[#CDDEFF] text-[#2E3135]"
                    : "text-[#797B7E] hover:bg-white/50"
                }`}
                onClick={() =>
                  setActiveTab(
                    tab === "Recent" ? "Active" : tab === "Old" ? "Draft" : tab
                  )
                }>
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
            {/* Menu icon for mobile - replaced with dropdown */}
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
                    onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
                  >
                    <CustomDropdown
                      options={[
                        "All Departments",
                        "Computer Science",
                        "Biochemistry",
                        "Mathematics",
                        "Physics",
                        "Electrical Engineering",
                        "General Studies",
                      ]}
                      defaultOption={activeDepartment}
                      onChange={(value) => {
                        setActiveDepartment(value);
                        // Keep dropdown open after selection
                      }}
                    />
                    <CustomDropdown
                      options={[
                        "All Levels",
                        "100 Level",
                        "200 Level",
                        "300 Level",
                        "400 Level",
                        "500 Level",
                      ]}
                      defaultOption={activeLevel}
                      onChange={(value) => {
                        setActiveLevel(value);
                        // Keep dropdown open after selection
                      }}
                    />
                  </div>
                )}
              </div>
            </div>{" "}
            {/* Dropdown for desktop - using mobile style */}
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
                    onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
                  >
                    <CustomDropdown
                      options={[
                        "All Departments",
                        "Computer Science",
                        "Biochemistry",
                        "Mathematics",
                        "Physics",
                        "Electrical Engineering",
                        "General Studies",
                      ]}
                      defaultOption={activeDepartment}
                      onChange={(value) => {
                        setActiveDepartment(value);
                        // Keep dropdown open after selection
                      }}
                    />
                    <CustomDropdown
                      options={[
                        "All Levels",
                        "100 Level",
                        "200 Level",
                        "300 Level",
                        "400 Level",
                        "500 Level",
                      ]}
                      defaultOption={activeLevel}
                      onChange={(value) => {
                        setActiveLevel(value);
                        // Keep dropdown open after selection
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course list */}

        <div className="space-y-8  ">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`px-4 py-3 border rounded-xl cursor-pointer w-full ${
                selectedCourse?.id === course.id
                  ? "border-2 border-[#FFB0E8] bg-white"
                  : "border-none hover:bg-gray-50 bg-white"
              }`}
              onClick={() => setSelectedCourse(course)}>
              {/* Flex container for main content */}
              <div className="flex items-start w-full">
                <div className="bg-blue-50 h-[87px] w-[87px] rounded-xl mr-3 flex-shrink-0 relative overflow-hidden">
                  <Image
                    src={course.image || "/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    sizes="77px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow">
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
                      <CircleDot size={14} className="mr-1 text-gray-400" />{" "}
                      {course.lessons}{" "}
                      <span className="text-[#8D8F91] ml-1">Lessons</span>
                    </span>
                    <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                      <Clock size={14} className="mr-1 text-gray-400 " />{" "}
                      {course.hours}{" "}
                      <span className="text-[#8D8F91] ml-1">Hours</span>
                    </span>
                    <span className="flex items-center text-[#2E3135] font-semibold ">
                      <Users size={14} className="mr-1 text-gray-400 " />{" "}
                      {course.enrolled}{" "}
                      <span className="text-[#8D8F91] ml-1">Enrolled</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile stats in their own block below the main content */}
              <div className="md:hidden w-full flex items-center text-xs text-gray-500 mt-4 pt-3 pl-1  border-t-2 border-gray-100">
                <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                  <CircleDot size={14} className="mr-1 text-gray-400" />{" "}
                  {course.lessons}
                </span>
                <span className="flex items-center mr-3 text-[#2E3135] font-semibold">
                  <Clock size={14} className="mr-1 text-gray-400" />{" "}
                  {course.hours}
                </span>
                <span className="flex items-center text-[#2E3135] font-semibold">
                  <Users size={14} className="mr-1 text-gray-400" />{" "}
                  {course.enrolled}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Course description */}
      <div className="bg-white rounded-xl   w-full  lg:ml-auto h-fit p-4">
        {selectedCourse ? (
          <div>
            <div className="mb-4   ">
              <div className="text-[12px] text-[#8D8F91] flex items-center">
                {selectedCourse.department}{" "}
                <span className="mx-2 text-gray-300 text-sm">•</span>
                <span style={{ color: getLevelColor(selectedCourse.level) }}>
                  {selectedCourse.level}
                </span>
              </div>
              <div className="flex items-center gap-3 ">
                <h2 className="text-[26px] font-bold">
                  {selectedCourse.title}
                </h2>
                <span
                  className={`text-xs w-[68px]  h-[24px] rounded-full flex justify-center items-center text-[14px]  font-medium  ${
                    selectedCourse.status === "Active"
                      ? "bg-[#FCF2F9] text-[#2E3135]"
                      : selectedCourse.status === "Draft"
                      ? "bg-[#FCF2F9] text-[#2E3135]"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  <div className="w-[6px] h-[6px] items-center mr-1">
                    <Image
                      src="/courses/Color Indicator.png"
                      alt=" color "
                      width={6}
                      height={6}
                      className="object-cover"
                    />
                  </div>

                  {selectedCourse.status}
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

                {/* Lessons count */}
                <span className="flex items-center mr-3">
                  <CircleDot size={14} className="mr-1 text-gray-400" />{" "}
                  <span className="text-[#2E3135] font-semibold mr-1">
                    {selectedCourse.lessons}{" "}
                  </span>{" "}
                  Lessons
                </span>

                {/* Hours count */}
                <span className="flex items-center mr-3">
                  <Clock size={14} className="mr-1 text-gray-400" />{" "}
                  <span className="text-[#2E3135] font-semibold mr-1">
                    {selectedCourse.hours}{" "}
                  </span>{" "}
                  Hours
                </span>

                {/* Enrolled count */}
                <span className="flex items-center">
                  <Users size={14} className="mr-1 text-gray-400" />{" "}
                  <span className="text-[#2E3135] font-semibold mr-1">
                    {selectedCourse.enrolled}{" "}
                  </span>{" "}
                  Enrolled
                </span>
              </div>
            </div>

            <div className="mb-4 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[340px] w-full rounded-md overflow-hidden relative">
              <Image
                src={
                  selectedCourse.coverImage || "/placeholder-course-cover.jpg"
                }
                alt={`${selectedCourse.title} cover image`}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1 text-[16px] text-[#2E3135]">
                About Course
              </h3>
              <p className="text-[14px] text-[#797B7E] ">
                {selectedCourse.description}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold mb-1 text-[16px] text-[#2E3135]">
                Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <div className="flex items-start">
                  <span className="text-pink-400 mr-2">✓</span>
                  <span className="text-sm text-[#797B7E]">
                    Hands-on projects & real-world case studies
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-400 mr-2">✓</span>
                  <span className="text-sm text-[#797B7E]">
                    Predictive analysis with Excel functions
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-400 mr-2">✓</span>
                  <span className="text-sm text-[#797B7E]">
                    Advanced Excel formulas & pivot tables
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-400 mr-2">✓</span>
                  <span className="text-sm text-[#797B7E]">
                    Business intelligence techniques
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-400 mr-2">✓</span>
                  <span className="text-sm text-[#797B7E]">
                    Data visualization using charts & dashboards
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-3 text-[16px] text-[#2E3135]">
                Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCourse.resources.map((resource, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-[12px] h-[12px] mr-3 text-gray-400">
                      {resource.type === "video" ? (
                        <CirclePlay size={18} className="text-[#797B7E]" />
                      ) : resource.type === "pdf" ? (
                        <FileText size={18} className="text-[#797B7E]" />
                      ) : (
                        <FileSpreadsheet size={18} className="text-[#797B7E]" />
                      )}
                    </div>
                    <span className="text-sm text-[#9FB9EB] hover:underline cursor-pointer truncate">
                      {resource.name}
                    </span>
                  </div>
                ))}
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
