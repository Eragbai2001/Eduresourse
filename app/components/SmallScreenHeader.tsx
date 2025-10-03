"use client";

import { useState, useEffect } from "react";
import {
  X,
  LayoutDashboard,
  Bookmark,
  Users,
  LogOut,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "./SearchBar";

interface SmallScreenHeaderProps {
  title: string;
}

export default function SmallScreenHeader({
  title = "Dashboard",
}: SmallScreenHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header className="fixed z-40 w-full h-16 bg-white px-6 flex items-center justify-between max-md:flex md:hidden border-b border-gray-100 top-0">
        {/* Left section - Logo matching sidebar */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Center section - Page title */}
        <div className="justify-center flex items-center">
          <h1 className="font-medium text-[#2E3135] text-[16px] font-hanken">
            {title}
          </h1>
        </div>

        {/* Right section - Search & Hamburger menu */}
        <div className="flex items-center max-md:flex md:hidden space-x-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Search">
            <Search className="h-5 w-5 text-gray-700" />
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Menu">
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out mt-1 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-in-out mt-1 ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out max-md:block md:hidden ${
          isMenuOpen
            ? "pointer-events-auto overflow-hidden"
            : "pointer-events-none"
        }`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-in-out`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Sliding menu panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 font-hanken text-[20px]">
                Coursify
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-6 py-4">
            <div className="space-y-2">
              {[
                {
                  href: "/dashboard",
                  label: "Dashboard",
                  icon: <LayoutDashboard size={18} />,
                },
                {
                  href: "/dashboard/courses",
                  label: "Courses",
                  icon: <Bookmark size={18} />,
                },
                {
                  href: "/dashboard/upload",
                  label: "Upload",
                  icon: <Users size={18} />,
                },
              ].map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 py-3 px-4 rounded-xl font-hanken transition-all duration-200 transform ${
                      isActive
                        ? "bg-[#FFEEFA] text-[#2E3135]"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    } ${
                      isMenuOpen
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                    }}
                    onClick={() => setIsMenuOpen(false)}>
                    <span
                      className={`${
                        isActive ? "text-[#2E3135]" : "text-gray-500"
                      }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div
              className={`flex items-center justify-center transition-all duration-300 transform ${
                isMenuOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: isMenuOpen ? "400ms" : "0ms",
              }}>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-[#797B7E] bg-[#F5F8FF] rounded-lg transition-colors cursor-pointer w-full">
                <LogOut size={20} />
                <span className="text-[14px] font-medium font-hanken">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal for Mobile */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-x-0 top-0 bg-white rounded-b-2xl shadow-2xl p-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => setIsSearchOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 font-hanken">
                Search Resources
              </h2>
            </div>
            <SearchBar
              placeholder="Search for courses, materials..."
              className="w-full"
              focusRingColor="focus:ring-purple-200"
              onResultClick={() => setIsSearchOpen(false)}
            />
            <p className="text-xs text-gray-500 mt-3 text-center font-hanken">
              Type to search across all resources
            </p>
          </div>
        </div>
      )}
    </>
  );
}
