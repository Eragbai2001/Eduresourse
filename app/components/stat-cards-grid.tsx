"use client";

import type React from "react";
import { StatCard } from "./start-card";
import Image from "next/image";
import { useEffect, useState } from "react";

// Icons as SVG components
const StudentIcon = () => (
  <Image
    src="/vector.png"
    alt="Student icon"
    width={30}
    height={30}
    className="block"
  />
);

const CourseIcon = () => (
  <Image
    src="/vector2.png"
    alt="Course icon"
    width={30}
    height={30}
    className="block"
  />
);

const EnrollmentIcon = () => (
  <Image
    src="/vector3.png"
    alt="Enrollment icon"
    width={30}
    height={30}
    className="block"
  />
);

interface StatCardsGridProps {
  stats?: Array<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    backgroundColor: string;
  }>;
}

export function StatCardsGrid({ stats }: StatCardsGridProps) {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();

        if (data.success && data.data?.overview) {
          setDashboardStats({
            totalStudents: data.data.overview.totalStudents,
            totalCourses: data.data.overview.totalCourses,
            totalEnrollments: data.data.overview.totalEnrollments,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const defaultStats = [
    {
      icon: <StudentIcon />,
      label: "Total Students",
      value: isLoading ? "..." : dashboardStats.totalStudents.toLocaleString(),
      backgroundColor: "#FFB0E8",
    },
    {
      icon: <CourseIcon />,
      label: "Total Courses",
      value: isLoading ? "..." : dashboardStats.totalCourses.toLocaleString(),
      backgroundColor: "#CDDEFF",
    },
    {
      icon: <EnrollmentIcon />,
      label: "Total Enrollments",
      value: isLoading
        ? "..."
        : dashboardStats.totalEnrollments.toLocaleString(),
      backgroundColor: "#FFD365",
    },
  ];

  const cardsToDisplay = stats || defaultStats;

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-6 w-full">
      {cardsToDisplay.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          backgroundColor={stat.backgroundColor}
          textColor="#000000"
          iconBgColor="#FFFFFF"
        />
      ))}
    </div>
  );
}
