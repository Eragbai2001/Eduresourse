"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import ProfileEditor from "@/app/components/ProfileEditor";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F8FF]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Profile" subtitle="Dashboard / Profile" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <ProfileEditor />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
