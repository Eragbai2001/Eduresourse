"use client";
import CustomDropdown from "@/app/components/CustomDropdown";
import React, { useState } from "react";
import { CircleDot, Clock, Users } from "lucide-react";
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
const courses = [
  {
    id: 1,
    title: "Introduction to Programming",
    category: "Computer Science",
    level: "100 Level",
    status: "Active",
    lessons: 18,
    hours: 30,
    enrolled: 280,
    price: 0,
    courseCode: "COS101",
    image: "/courses/programming.png",
    description:
      "Foundational programming concepts, algorithms, and problem-solving techniques. Covers basic syntax, data types, control structures, and introductory data structures.",
  },
  {
    id: 2,
    title: "Calculus and Analytical Geometry",
    category: "Mathematics",
    level: "100 Level",
    status: "Active",
    lessons: 20,
    hours: 40,
    enrolled: 320,
    price: 0,
    courseCode: "MTH101",
    image: "/courses/math.png",
    description:
      "Introduction to differential and integral calculus. Topics include limits, derivatives, applications of differentiation, integration techniques, and applications of integrals.",
  },
  {
    id: 3,
    title: "Total Man Concept",
    category: "General Studies",
    level: "200 Level",
    status: "Active",
    lessons: 12,
    hours: 24,
    enrolled: 450,
    price: 0,
    courseCode: "TMC201",
    image: "/courses/tmc.png",
    description:
      "Holistic development course focusing on intellectual, physical, spiritual, and social dimensions. Emphasizes character formation, leadership skills, and societal values.",
  },
  {
    id: 4,
    title: "Object-Oriented Programming with Java",
    category: "Computer Science",
    level: "200 Level",
    status: "Draft",
    lessons: 25,
    hours: 50,
    enrolled: 350,
    price: 0,
    courseCode: "COS201",
    image: "/courses/java.png",
    description:
      "Core concepts of object-oriented programming using Java. Topics include classes, objects, inheritance, polymorphism, encapsulation, and interface implementation.",
  },
  {
    id: 5,
    title: "Entrepreneurial Development Studies",
    category: "Business",
    level: "300 Level",
    status: "Active",
    lessons: 15,
    hours: 30,
    enrolled: 380,
    price: 0,
    courseCode: "EDS301",
    image: "/courses/entrepreneurship.png",
    description:
      "Practical approach to entrepreneurship development, business creation, opportunity identification, business planning, and venture capital acquisition.",
  },
];

export default function CoursesPage() {
  // State to track the selected course
  const [selectedCourse, setSelectedCourse] = useState(courses[2]); // Default to Business Analytics course
  const [activeTab, setActiveTab] = useState("All");

  // Filter courses based on active tab
  const filteredCourses =
    activeTab === "All"
      ? courses
      : courses.filter((course) => course.status === activeTab);

  return (
    <div className="h-full w-full bg-[#F5F8FF] flex flex-col lg:flex-row lg:justify-between gap-4 font-hanken">
      {/* Left side - Courses list */}
      <div className="bg-[#F5F8FF]   w-full mb-4 lg:mb-0 h-full">
        {/* Simple tab filter */}
        <div className="flex items-center justify-between ">
          <div className="bg-white  rounded-xl  flex mb-4">
            {["All", "Active", "Draft", "Archived"].map((tab) => (
              <button
                key={tab}
                className={`py-2 px-4 rounded-xl text-sm font-medium  w-full ${
                  activeTab === tab
                    ? "bg-[#CDDEFF]  text-[#2E3135]"
                    : "text-[#797B7E] hover:bg-white/50"
                }`}
                onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* Simple category dropdown */}
          <div className="mb-4 relative">
            <CustomDropdown
              options={[
                "All Category",
                "Business",
                "Design",
                "Marketing",
                "Development",
              ]}
              className="mb-4"
            />
          </div>
        </div>

        {/* Course list */}

        <div className="space-y-8   h-[calc(100vh-200px)] overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`px-4 py-3 border rounded-xl cursor-pointer flex items-center  w-full ${
                selectedCourse?.id === course.id
                  ? " border-2 border-[#FFB0E8] bg-white"
                  : "border-none hover:bg-gray-50 bg-white"
              }`}
              onClick={() => setSelectedCourse(course)}>
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
                {/* Category and level ABOVE the title */}
                <div className="flex text-sm items-center">
                  <span className="text-[#8D8F91] text-[12px]">
                    {course.category}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span
                    className="text-[12px]"
                    style={{ color: getLevelColor(course.level) }}>
                    {course.level}
                  </span>
                </div>

                {/* Title BELOW category and level */}
                <h3 className="font-semibold text-[#2E3135]  text-[18px]">
                  {course.title}
                </h3>

                <div className="flex items-center text-xs text-gray-500 mt-4">
                  <span className="flex items-center mr-3">
                    <CircleDot size={14} className="mr-1 text-gray-400" />{" "}
                    {course.lessons} Lessons
                  </span>
                  <span className="flex items-center mr-3">
                    <Clock size={14} className="mr-1 text-gray-400" />{" "}
                    {course.hours} Hours
                  </span>
                  <span className="flex items-center">
                    <Users size={14} className="mr-1 text-gray-400" />{" "}
                    {course.enrolled} Enrolled
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Course description */}
      <div className="bg-white rounded-xl   w-full lg:ml-auto h-full p-4">
        {selectedCourse ? (
          <div>
            <div className="mb-4   ">
              <div className="text-[12px] text-[#8D8F91] flex items-center">
                {selectedCourse.category}{" "}
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
              <div className="flex items-center text-xs text-gray-500 mt-3 gap-3.5 ">
                <span className="flex items-center mr-3">
                  <CircleDot size={14} className="mr-1 text-gray-400" />{" "}
                  {selectedCourse.lessons} Lessons
                </span>
                <span className="flex items-center mr-3">
                  <Clock size={14} className="mr-1 text-gray-400" />{" "}
                  {selectedCourse.hours} Hours
                </span>
                <span className="flex items-center">
                  <Users size={14} className="mr-1 text-gray-400" />{" "}
                  {selectedCourse.enrolled} Enrolled
                </span>
              </div>
            </div>

            <div className="mb-4 h-40 bg-gray-100 rounded-md"></div>

            <div className="mb-4">
              <h3 className="font-semibold mb-1 text-[16px] text-[#2E3135]">
                About Course
              </h3>
              <p className="text-[14px] text-[#797B7E] ">
                {selectedCourse.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <h4 className="text-xs text-gray-500">Lessons</h4>
                <p className="text-sm">{selectedCourse.lessons} Lessons</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Duration</h4>
                <p className="text-sm">{selectedCourse.hours} Hours</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Enrolled</h4>
                <p className="text-sm">{selectedCourse.enrolled} Students</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500">Price</h4>
                <p className="text-sm font-medium text-purple-600">
                  ${selectedCourse.price}
                </p>
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
