"use client";
import React, { useEffect, useState } from "react";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { DashboardSidebar } from "./dashboard-sidebar";

interface HeaderProps {
  title: string;
  subtitle?: string | null;
  dashboardColor?: string;
  separatorColor?: string;
  pageColor?: string;
}

export default function Header({
  title = "Dashboard",
  subtitle,
  dashboardColor = "text-blue-600",
  separatorColor = "text-gray-500",
  pageColor = "text-gray-500",
}: HeaderProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start with loading state true
    setLoading(true);

    if (user) {
      console.log("User metadata:", user.user_metadata);
      // Only set loading to false when we have user data
      setLoading(false);
    } else {
      // If no user after a short delay, still set loading to false to show generic state
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Extract first name from user metadata or email
  const getFirstName = () => {
    // First try to get name from OAuth metadata
    if (user?.user_metadata) {
      // Log the metadata to see what's available
      console.log("User metadata in getFirstName:", user.user_metadata);

      // Try different metadata fields where name might be stored
      // Prioritize full_name from email signup users
      const fullName =
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.user_metadata.given_name;

      if (fullName && typeof fullName === "string") {
        // If we have a full name, split it to get the first name
        return fullName.split(" ")[0];
      }
    }

    // If no name in metadata, fall back to email
    if (user?.email) {
      const emailName = user.email.split("@")[0];
      let cleanName = emailName.replace(/[._]/g, " ").replace(/[0-9]/g, "");

      cleanName = cleanName
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return cleanName.split(" ")[0];
    }

    return "User";
  };

  // Only get the firstName if we're not in loading state
  const firstName = loading ? null : getFirstName();

  // Get avatar URL from metadata (from OAuth providers) if available
  // Ignore UI Avatars URLs to prevent the flickering issue
  let avatarUrl = loading
    ? ""
    : user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  // If the avatar URL is from UI Avatars, don't use it
  if (avatarUrl && avatarUrl.includes("ui-avatars.com")) {
    avatarUrl = "";
  }

  // Determine what to display in the subtitle area
  const renderSubtitle = () => {
    // If it's a breadcrumb style subtitle (contains "Dashboard /")
    if (subtitle && subtitle.includes("Dashboard /")) {
      return (
        <p className="text-sm font-hanken">
          <span className={`${dashboardColor} font-medium`}>Dashboard</span>
          <span className={separatorColor}> / </span>
          <span className={pageColor}>{subtitle.split("Dashboard / ")[1]}</span>
        </p>
      );
    }

    // If it's the main dashboard page (subtitle is null) or any other page without breadcrumb
    return (
      <p className="text-sm text-gray-500 font-hanken">
        {subtitle ||
          (firstName ? `Hello ${firstName}, welcome back!` : `Welcome back!`)}
      </p>
    );
  };

  return (
    <header className="h-16 bg-[#F5F8FF] px-6 items-center max-md:hidden md:flex max-w-7xl gap-10 min-[1535px]:max-[1900px]:pr-[390px] ">
      {/* Left section containing title, welcome message and search bar */}
      <div className="flex-1 flex items-center justify-between max-w-7xl  ">
        {/* Title and subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-hanken">
            {title}
          </h1>
          {loading ? (
            <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          ) : (
            renderSubtitle()
          )}
        </div>

        {/* Search bar */}
        <SearchBar
          placeholder="Search resources..."
          className="max-lg w-64"
          focusRingColor="focus:ring-purple-200"
        />
      </div>


            {/* Right section containing profile, notifications and settings */}
   <div className="flex 2xl:hidden items-center justify-center pl-3.5 py-2 rounded-lg space-x-2">
        {/* Profile */}
        <div className="flex items-center">
          {loading ? (
            <>
              <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="ml-2 max-lg:hidden">
                <div className="h-4 w-24 bg-gray-200 rounded-md animate-pulse mb-1"></div>
                <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </>
          ) : (
            <>
              {loading ? (
                <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
              ) : avatarUrl ? (
                <div className="relative w-[40px] h-[40px] rounded-lg overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="User avatar"
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-[40px] h-[40px] rounded-lg bg-[#FFB0E8] text-white font-medium">
                  {firstName ? firstName.substring(0, 2).toUpperCase() : ""}
                </div>
              )}
              {/* Text container - completely hidden on tablet/small laptop screens, no space taken */}
              <div className="text-sm max-lg:hidden ml-2">
                <p className="font-medium text-gray-800 font-hanken">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    ""}
                </p>
                <p className="text-xs text-gray-500 font-hanken">
                  {user?.email || ""}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {loading ? (
            <>
              <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
              <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>


      
    </header>
  );
}
