"use client";

import { HorizontalAccordion } from "@/app/components/horizontal-accordion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CourseFile = string;

interface Course {
  id: string;
  userId: string;
  department: string;
  level: string;
  title: string;
  description: string;
  features: string[];
  files: CourseFile[];
  coverPhoto: string | null;
  coverColor: string;
  resourceCount: number;
  downloadCount: number;
  createdAt: string;
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/resources/${courseId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        router.push("/dashboard/courses?tab=myuploads");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-hanken">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 font-hanken text-lg mb-4">
            Course not found
          </p>
          <button
            onClick={() => router.push("/dashboard/courses?tab=myuploads")}
            className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to My Uploads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent font-hanken">
      <div className="w-full max-w-[1100px] mx-auto">
        <HorizontalAccordion
          editMode={true}
          courseId={course.id}
          initialData={{
            department: course.department,
            level: course.level,
            title: course.title,
            description: course.description,
            features: course.features,
            files: course.files,
          }}
          onClose={() => {
            router.push("/dashboard/courses?tab=myuploads");
          }}
        />
      </div>
    </div>
  );
}
