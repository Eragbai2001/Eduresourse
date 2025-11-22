"use client";
import { EnrollmentTrendsChart } from "../components/enrollment-trends-chart";

import { StatCardsGrid } from "../components/stat-cards-grid";
import { RecentCoursesSection } from "../components/RecentCoursesSection";

import { TopCourses } from "../components/top-courses";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { Calendar } from "../components/calendar";

import { RecentActivities } from "../components/recent-activities";
import LearningActivityHeatmap from "../components/LearningActivity";
import ActivityHeatmap from "../components/ActivityHeatmap";

const xLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const yLabels = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm"];
const values = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 50, 100, 150, 150, 100, 0],
  [0, 100, 150, 200, 150, 100, 0],
  [0, 100, 150, 150, 100, 50, 0],
  [0, 0, 50, 100, 100, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#F5F8FF] font-hanken">
      {/* Main Content Area */}
      <div className="flex-1 2xl:mr-[400px] ">
        <div className="max-w-7xl mx-auto">
          {/* Stat Cards */}
          <StatCardsGrid />

          {/* Calendar & Schedule Grid - Only visible below 1700px */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 2xl:hidden">
            <Calendar />

            <div className="">
              <RecentActivities />
            </div>
          </div>

          {/* Top Courses & Enrollment Trends */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopCourses />
            <EnrollmentTrendsChart />
          </div>

          {/* Recent Courses Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className=" hidden xl:grid xl:col-span-1">
              <ActivityHeatmap
                data={values}
                xLabels={xLabels}
                yLabels={yLabels}
              />
            </div>
            <div className="  col-span-3 xl:col-span-2">
              <RecentCoursesSection />
            </div>
          </div>
          <div className=" grid xl:hidden mt-12">
            <ActivityHeatmap
              data={values}
              xLabels={xLabels}
              yLabels={yLabels}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
