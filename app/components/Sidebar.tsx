"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  Bookmark,
  Users,
  GraduationCap,
  DollarSign,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  href,
  icon,
  text,
  isActive,
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 py-2 rounded-xl transition-colors lg:w-[173px] h-[39px] lg:px-4 md:max-lg:w-[40px] md:max-lg:mx-auto md:max-lg:justify-center ${
        isActive
          ? "bg-[#FFEEFA] text-[#2E3135]"
          : "hover:bg-gray-100 text-[#797B7E]"
      }`}>
      <div className="w-5 h-5">{icon}</div>
      <span className="text-[14px] font-medium font-hanken max-lg:hidden">
        {text}
      </span>
    </Link>
  );
};

export default function Sidebar() {
  // Get the current path to determine which link is active
  const pathname = usePathname();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="lg:w-[221px] md:max-lg:w-[60px] h-screen flex flex-col bg-white ">
      {/* Logo area with actual image */}
      <div className="flex gap-2 py-6 pt-3 max-lg:justify-center lg:px-4 md:max-lg:px-0 items-center">
        <div className="relative w-10 h-10 overflow-visible">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="font-semibold text-gray-900 font-hanken max-lg:hidden text-[24px]">
          Coursify
        </span>
      </div>

      {/* Navigation links - with overflow handling */}
      <div className="flex-1 flex flex-col gap-1 lg:px-3 md:max-lg:px-0 md:max-lg:items-center overflow-y-auto">
        <SidebarLink
          href="/dashboard"
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          isActive={pathname === "/dashboard"}
        />
        <SidebarLink
          href="/dashboard/messages"
          icon={<MessageSquare size={20} />}
          text="Messages"
          isActive={pathname === "/dashboard/messages"}
        />
        <SidebarLink
          href="/dashboard/calendar"
          icon={<Calendar size={20} />}
          text="Calendar"
          isActive={pathname === "/dashboard/calendar"}
        />
        <SidebarLink
          href="/dashboard/enrollments"
          icon={<FileText size={20} />}
          text="Enrollments"
          isActive={pathname === "/dashboard/enrollments"}
        />
        <SidebarLink
          href="/dashboard/courses"
          icon={<Bookmark size={20} />}
          text="Courses"
          isActive={pathname === "/dashboard/courses"}
        />
        <SidebarLink
          href="/dashboard/instructors"
          icon={<Users size={20} />}
          text="Instructors"
          isActive={pathname === "/dashboard/instructors"}
        />
        <SidebarLink
          href="/dashboard/students"
          icon={<GraduationCap size={20} />}
          text="Students"
          isActive={pathname === "/dashboard/students"}
        />
        <SidebarLink
          href="/dashboard/financials"
          icon={<DollarSign size={20} />}
          text="Financials"
          isActive={pathname === "/dashboard/financials"}
        />
      </div>

      {/* Upgrade card - centered with flex, hidden on smaller screens and tablet */}
      <div className="flex justify-start max-lg:hidden">
        <div className="m-3 p-3 bg-[#FFD365] rounded-lg relative pt-12 w-[173px]">
          {/* Image positioned at top center, partially outside the div - using decimal values */}
          <div className="absolute top-0 left-[50%] transform translate-x-[-50%] translate-y-[-65%]">
            <div className="w-[119px] h-[116.43px] relative">
              <Image
                src="/sidebar/Illustration.png"
                alt="Upgrade illustration"
                width={119}
                height={116.43}
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h3 className="text-[14px] font-bold text-center mb-0.5 font-hanken  text-[#2E3135]">
            Upgrade to Pro
          </h3>
          <p className="text-[10px] text-center text-gray-600 mb-2 font-hanken">
            Unlock premium features & enhance your LMS experience!
          </p>
          <button className="w-full py-1.5 bg-white text-gray-800 rounded-md text-[10px]  font-hanken hover:bg-gray-50 transition-colors font-medium cursor-pointer">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="lg:p-3 md:max-lg:py-3 md:max-lg:flex md:max-lg:justify-center border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 lg:px-4 py-2 text-[#797B7E] bg-[#F5F8FF] rounded-lg transition-colors cursor-pointer lg:w-[173px] h-[39px] md:max-lg:w-[40px] md:max-lg:justify-center">
          <LogOut size={20} />
          <span className="text-[14px] font-medium font-hanken max-lg:hidden">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
