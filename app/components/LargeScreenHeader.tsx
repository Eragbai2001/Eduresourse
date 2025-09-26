"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Search, Bell,  } from "lucide-react";

export default function LargeScreenHeader() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-[#F5F8FF] px-6 items-center max-md:hidden md:flex ">
      {/* Left section with logo and navigation */}
      <div className="flex-1">
        <Link href="/" className="font-bold text-xl font-hanken text-blue-600">
          EduResource
        </Link>
      </div>

      {/* Right section with search, auth, and user info */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-64 text-sm font-hanken focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        {loading ? (
          <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse"></div>
        ) : user ? (
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-blue-600" />

            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {getUserInitials()}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
              </div>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
