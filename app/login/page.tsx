"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Failed to sign in with Google";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof AuthError
          ? error.message
          : "Failed to sign in with GitHub";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row  bg-[#E8F0FF]">
      {/* Left Side - Animated Illustration - Now visible on all screens */}
      <div className="w-full lg:w-3/5 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden py-10 lg:py-0 lg:min-h-screen">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-pink-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/20 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-yellow-400/20 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-green-400/20 rounded-full animate-bounce delay-700"></div>
        </div>

        {/* Main character/illustration area */}
        <div className="flex items-center justify-center w-full h-full relative z-10 lg:min-h-screen">
          <div className="text-center space-y-8 animate-fade-in">
            {/* Animated text */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white animate-slide-up">
                Welcome to EduResource
              </h1>
              <p className="text-lg lg:text-xl text-purple-200 animate-slide-up delay-200">
                Your journey to knowledge starts here
              </p>
            </div>

            {/* Floating elements - Hidden on smallest screens to save space */}
            <div className="hidden sm:flex justify-center space-x-8 animate-slide-up delay-400">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-yellow-400/30 rounded-2xl flex items-center justify-center animate-bounce delay-300">
                <svg
                  className="w-6 lg:w-8 h-6 lg:h-8 text-yellow-300"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-blue-400/30 rounded-2xl flex items-center justify-center animate-bounce delay-500">
                <svg
                  className="w-6 lg:w-8 h-6 lg:h-8 text-blue-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-green-400/30 rounded-2xl flex items-center justify-center animate-bounce delay-700">
                <svg
                  className="w-6 lg:w-8 h-6 lg:h-8 text-green-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/5 bg-[#E8F0FF] flex items-center justify-center p-8 lg:min-h-screen">
        <div className="w-full max-w-md animate-slide-in-right">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}
          <Card className=" border-0 g-pink-50">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="flex justify-center mb-4">
                {/* Logo image */}
                <div className="w-16 h-16 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="EduResource Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-gray-800">
                  EduResource
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Sign in to continue your learning journey
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full h-14 text-gray-700 border-2 border-pink-200 hover:bg-pink-50 bg-white hover:border-pink-300 transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-medium">
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Loading..." : "Continue with Google"}
              </Button>

              <Button
                onClick={handleGitHubSignIn}
                disabled={loading}
                className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg font-medium">
                <svg
                  className="w-6 h-6 mr-3"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {loading ? "Loading..." : "Continue with GitHub"}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
