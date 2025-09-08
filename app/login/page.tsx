"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { LoginImage } from "../components/LoginImage";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // login or signup

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if login was successful
      if (data?.user) {
        toast.success("Login successful! Redirecting...");
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    } catch (error: unknown) {
      console.error("Sign-in error:", error); // For debugging
      const errorMessage =
        error instanceof AuthError ? error.message : 
        error instanceof Error ? error.message : 
        "Failed to sign in with email and password";
      toast.error(errorMessage);
      setError(null); // Clear the error state since we're using toast
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate email and password
      if (!email || !password) {
        throw new Error("Email and password are required");
      }
      
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      console.log("Sign-up response:", data); // For debugging

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast.error("This email is already registered");
        return;
      }

      if (data?.user?.confirmed_at || data?.user?.email_confirmed_at) {
        toast.success("Account created successfully! You can now log in.");
      } else {
        toast.success(
          "Account created! Please check your email to confirm your account."
        );
      }

      // Reset form
      setEmail("");
      setPassword("");
      
    } catch (error: unknown) {
      console.error("Sign-up error:", error); // For debugging
      const errorMessage =
        error instanceof AuthError ? error.message : 
        error instanceof Error ? error.message : 
        "Failed to create account";
      toast.error(errorMessage);
      setError(null); // Clear the error state since we're using toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
    
      {/* Left Side - Image carousel */}
      <LoginImage title="Share, Learn, Succeed" />

      {/* Right Side - Login Form (RIVE-inspired) */}
      <div className="w-full lg:w-2/5 bg-white flex items-center justify-center p-8 min-h-screen font-hanken">
        <div className="w-full max-w-md animate-slide-in-right">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-base">
              {error}
            </div>
          )}

          {/* Logo centered at the top */}
          <div className="flex flex-col items-start justify-center mb-8">
            {/* Logo with text side by side */}
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
              <span className="font-semibold text-gray-900 font-hanken text-[28px]">
                <span className="font-semibold text-gray-900 font-hanken  text-4xl">
                  Coursify
                </span>
              </span>
            </div>
          </div>

          {/* Express login via Google text */}
          <div className="text-left mb-4">
            <p className="text-gray-500 text-[20px]">
              Express login via Google
            </p>
          </div>

          {/* Google Sign In Button - Styled like RIVE */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-[95%] flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-md py-4 px-5 mb-3 transition-all cursor-pointer group hover:text-gray-950">
            <span className="text-gray-500 font-medium group-hover:text-gray-950 text-xl">
              Google
            </span>
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path
                className="transition-colors fill-gray-300 group-hover:fill-[#4285F4]"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                className="transition-colors fill-gray-300 group-hover:fill-[#34A853]"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                className="transition-colors fill-gray-300 group-hover:fill-[#FBBC05]"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                className="transition-colors fill-gray-300 group-hover:fill-[#EA4335]"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          <div className="border-2 border-gray-100 w-[95%] my-6"></div>

          {/* Tab selector for Login/Signup */}
          <div className="w-[95%]">
            {/* Tab buttons in their own row */}
            <div className="grid grid-cols-4">
              <div className=" bg-gray-100 rounded-t-xl">
                <button
                  onClick={() => setActiveTab("login")}
                  className={`py-4 font-medium w-full text-xl relative rounded-br-xl  rounded-tr-xl rounded-tl-xl ${
                    activeTab === "login"
                      ? "bg-gray-100 text-black font-bold  "
                      : "bg-white text-gray-500"
                  }`}>
                  <div>Log in</div>
                </button>
              </div>
              <div className=" bg-gray-100 rounded-t-xl ">
                <button
                  onClick={() => setActiveTab("signup")}
                  className={`py-4 font-medium  w-full text-xl rounded-bl-xl  rounded-tr-xl rounded-tl-xl ${
                    activeTab === "signup"
                      ? "bg-gray-100 text-gray-800 rounded-t-lg"
                      : "bg-white text-gray-500"
                  }`}>
                  <div>Sign up</div>
                </button>
              </div>
              <div className=" bg-gray-100 rounded-t-xl">
                <button className="py-4 font-medium w-full h-full text-xl relative rounded-bl-xl bg-white ">
                  <div className=""></div>
                </button>
              </div>
            </div>

            {/* Form in its own container */}
            <form
              onSubmit={
                activeTab === "login" ? handleEmailSignIn : handleEmailSignUp
              }
              className="w-full">
              <div className="space-y-1 w-full">
                <div>
                  <input
                    type="email"
                    placeholder={
                      activeTab === "login" ? "email or username" : "email"
                    }
                    className="w-full p-4 bg-gray-100 rounded-tr-lg outline-none text-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-700 text-white py-4 rounded-b-xl font-medium transition-all text-xl">
                  {loading
                    ? "Loading..."
                    : activeTab === "login"
                    ? "Log in"
                    : "Sign up"}
                </button>
              </div>
            </form>

            {/* Additional options */}
            <div className="mt-6 text-left">
              <button className="text-black hover:text-gray-700 text-lg cursor-pointer">
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
