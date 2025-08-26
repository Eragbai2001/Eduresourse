import React from "react";
import { Search, Bell, Settings } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  dashboardColor?: string; // Custom color for "Dashboard" in the breadcrumb
  separatorColor?: string; // Custom color for the separator "/"
  pageColor?: string; // Custom color for the current page in the breadcrumb
}

export default function Header({
  title = "Dashboard",
  subtitle = "Hello Phillip, welcome back!",
  dashboardColor = "text-blue-600", // Default color for "Dashboard"
  separatorColor = "text-gray-500", // Default color for separator
  pageColor = "text-gray-500", // Default color for current page
}: HeaderProps) {
  return (
    <header className="h-16 border-gray-200 bg-[#F5F8FF] px-6 items-center max-md:hidden md:flex">
      {/* Left section containing title, welcome message and search bar */}
      <div className="flex-1 flex items-center justify-between ">
        {/* Title and subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-hanken">
            {title}
          </h1>
          {subtitle && subtitle.includes("Dashboard") ? (
            <p className="text-sm font-hanken">
              <span className={`${dashboardColor} font-medium`}>Dashboard</span>
              <span className={separatorColor}> / </span>
              <span className={pageColor}>
                {subtitle.split("Dashboard / ")[1]}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-hanken">{subtitle}</p>
          )}
        </div>

        {/* Search bar */}
        <div className="relative max-lg">
          <input
            type="text"
            placeholder="Search anything"
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-64 text-sm font-hanken focus:outline-none focus:ring-2 focus:ring-purple-200 text-[#8D8F91]"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Right section containing profile, notifications and settings */}
      <div className="flex items-center justify-center bg-[#F5F8FF] pl-3.5   py-2 rounded-lg space-x-2">
        {/* Profile */}
        <div className="flex items-center">
          <div className="relative w-[40px] h-[40px] rounded-lg overflow-hidden bg-purple-100">
            {/* Placeholder for profile image - replace with actual image path when available */}
            <div className="absolute inset-0 rounded-lg bg-[#F588D6] flex items-center justify-center text-white font-medium">
              PS
            </div>
          </div>
          {/* Text container - completely hidden on tablet/small laptop screens, no space taken */}
          <div className="text-sm max-lg:hidden ml-2">
            <p className="font-medium text-gray-800 font-hanken">
              Phillip Stanton
            </p>
            <p className="text-xs text-gray-500 font-hanken">Admin</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="bg-white rounded-lg p-1.5 w-[40px] h-[40px] justify-center flex">
            <button className="relative ">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#F588D6] rounded-full"></span>
            </button>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg p-1.5 w-[40px] h-[40px] justify-center flex">
            <button className=" ">
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
