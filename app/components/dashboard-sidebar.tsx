"use client";
import { Calendar } from "./calendar";
import { Schedule } from "./schedule";
import { RecentActivities } from "./recent-activities";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Bell, Settings } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function DashboardSidebar() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    if (user) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Get first name from user metadata
  const getFirstName = () => {
    if (user?.user_metadata) {
      const fullName =
        user.user_metadata.full_name ||
        user.user_metadata.name ||
        user.user_metadata.given_name;

      if (fullName && typeof fullName === "string") {
        return fullName.split(" ")[0];
      }
    }

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

  const firstName = loading ? null : getFirstName();

  // Get avatar URL
  let avatarUrl = loading
    ? ""
    : user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  // Don't use UI Avatars URLs
  if (avatarUrl && avatarUrl.includes("ui-avatars.com")) {
    avatarUrl = "";
  }

  // Head section (profile + notifications) — shown on all pages
  const headSection = (
    <div className="flex items-center justify-between">
      {/* Profile */}
      <div className="flex items-center gap-4 flex-1">
        {loading ? (
          <>
            <div className="w-[48px] h-[48px] rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 w-28 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              <div className="h-3 w-36 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </>
        ) : (
          <>
            {avatarUrl ? (
              <div className="relative w-[48px] h-[48px] rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={45}
                  height={45}
                  className="rounded-lg object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-[48px] h-[48px] rounded-lg bg-[#FFB0E8] text-white font-semibold text-base flex-shrink-0">
                {firstName ? firstName.substring(0, 2).toUpperCase() : ""}
              </div>
            )}
            {/* Text container */}
            <div className="text-sm flex-1 min-w-0">
              <p className="font-semibold text-gray-900 font-hanken truncate">
                {user?.user_metadata?.full_name ||
                  user?.user_metadata?.name ||
                  "User"}
              </p>
              <p className="text-xs text-gray-500 font-hanken truncate">
                {user?.email || ""}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Notifications and Settings */}
      <div className="flex items-center gap-2 ml-2">
        {loading ? (
          <>
            <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="w-[40px] h-[40px] rounded-lg bg-gray-200 animate-pulse"></div>
          </>
        ) : (
          <>
            {/* Notifications */}
            <button className="relative bg-gray-50 hover:bg-gray-100 rounded-lg p-2 w-[40px] h-[40px] flex items-center justify-center transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F588D6] rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="bg-gray-50 hover:bg-gray-100 rounded-lg p-2 w-[40px] h-[40px] flex items-center justify-center transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}
      </div>
    </div>
  );

  // Full sidebar content for dashboard page
  const fullContent = (
    <div className="p-3 space-y-6">
      {headSection}

      <div className="bg-gray-50 rounded-lg">
        <Calendar />
      </div>

      <div className="bg-gray-50 rounded-lg">
        <RecentActivities />
      </div>
    </div>
  );

  // Compact content for other pages — only head, no white bg to avoid covering UI
  const compactContent = <div className="p-3">{headSection}</div>;

  return (
    <div
      className={
        pathname === "/dashboard"
          ? "w-full h-full bg-white border-l border-gray-100 overflow-y-auto"
          : "w-full h-full overflow-y-auto bg-transparent"
      }>
      {pathname === "/dashboard" ? fullContent : compactContent}
    </div>
  );
}
