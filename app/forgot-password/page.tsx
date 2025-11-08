"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { LoginImage } from "../components/LoginImage";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!email) {
        throw new Error("Email is required");
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : error instanceof Error
          ? error.message
          : "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Image carousel */}
      <LoginImage />

      {/* Right Side - Forgot Password Form (RIVE-inspired) */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8 min-h-screen font-hanken">
        <div className="w-full max-w-md animate-slide-in-right">
          {/* Logo centered at the top */}
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

          {!emailSent ? (
            <>
              {/* Title and description */}
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                  Forgot Password
                </h1>
                <p className="text-gray-500 text-lg">
                  Forgot your password? Type in the email or username associated
                  with your account and we&apos;ll send you an email to reset
                  it.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="email or username"
                    className="w-full p-4 bg-gray-100 rounded-md outline-none text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-700 text-white py-4 rounded-md font-medium transition-all text-xl">
                  {loading ? "Sending..." : "Send Email"}
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
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    Check your email
                  </h2>
                  <p className="text-gray-500 text-lg mb-2">
                    We&apos;ve sent a password reset link to
                  </p>
                  <p className="text-gray-900 font-medium text-lg mb-6">
                    {email}
                  </p>
                  <p className="text-gray-500 text-base">
                    Didn&apos;t receive the email? Check your spam folder or
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="text-black hover:text-gray-700 text-lg underline cursor-pointer mb-6">
                  Try another email address
                </button>

                <div className="mt-8">
                  <Link
                    href="/login"
                    className="text-black hover:text-gray-700 text-lg underline cursor-pointer">
                    Back to sign in
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
