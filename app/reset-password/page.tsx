"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { LoginImage } from "../components/LoginImage";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Invalid or expired reset link");
        router.push("/forgot-password");
      }
    });
  }, [router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!password || !confirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast.success("Password updated successfully! Redirecting to login...");

      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Image carousel */}
      <LoginImage />

      {/* Right Side - Reset Password Form (RIVE-inspired) */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8 min-h-screen font-hanken">
        <div className="w-full max-w-md animate-slide-in-right">
          {/* Logo */}
          <div className="flex flex-col items-start justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12 overflow-visible">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-semibold text-gray-900 font-hanken text-4xl">
                Coursify
              </span>
            </div>
          </div>

          {/* Title and description */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">
              Reset Password
            </h1>
            <p className="text-gray-500 text-lg">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="new password"
                className="w-full p-4 bg-gray-100 rounded-md outline-none text-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="confirm password"
                className="w-full p-4 bg-gray-100 rounded-md outline-none text-lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base">
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-700 text-white py-4 rounded-md font-medium transition-all text-xl">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to sign in link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-black hover:text-gray-700 text-lg underline cursor-pointer">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
