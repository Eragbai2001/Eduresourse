"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/app/components/Header";
import SmallScreenHeader from "@/app/components/SmallScreenHeader";
import Sidebar from "@/app/components/Sidebar";

// Function to generate page title and subtitle from pathname
function getPageInfo(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  // Default for dashboard
  if (segments.length === 1 && segments[0] === "dashboard") {
    return {
      title: "Dashboard",
      subtitle: "Hello Phillip, welcome back!",
    };
  }

  // For other pages
  if (segments.length > 1) {
    const currentPage = segments[segments.length - 1];
    // Capitalize the first letter
    const title = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    // Set appropriate subtitles for each page
    let subtitle = "";
    switch (currentPage.toLowerCase()) {
      case "courses":
        subtitle = "Dashboard / Courses";
        break;
      case "students":
        subtitle = "Dashboard / Students";
        break;
      case "instructors":
        subtitle = "Dashboard / Instructors";
        break;
      case "enrollments":
        subtitle = "Dashboard / Enrollments";
        break;
      case "financials":
        subtitle = "Dashboard / Financials";
        break;
      case "messages":
        subtitle = "Dashboard / Messages";
        break;
      case "calendar":
        subtitle = "Dashboard / Calendar";
        break;
      default:
        subtitle = `Manage your ${currentPage.toLowerCase()}`;
    }

    return { title, subtitle };
  }

  // Default fallback
  return {
    title: "Dashboard",
    subtitle: "Hello Phillip, welcome back!",
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { title, subtitle } = getPageInfo(pathname);

  // Set colors based on the current page
  const dashboardColor = "text-[#F26CF9]";
  const pageColor = "text-[#777779]";

  return (
    <div className="h-screen bg-[#F5F8FF]">
      <div className="flex h-full">
        {/* Sidebar - visible at md screens and above */}
        <div className="md:block hidden">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col">
          <div className=" mt-3">
            {/* Original header (visible at md and above) */}
            <Header
              title={title}
              subtitle={subtitle}
              dashboardColor={dashboardColor}
              pageColor={pageColor}
            />

            {/* Small screen header (visible at max-md) */}
            <SmallScreenHeader title={title} />
          </div>
          <main className="flex-1 p-6 bg-[#F5F8FF] overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
