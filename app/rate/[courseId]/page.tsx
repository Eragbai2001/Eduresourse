"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function RateCoursePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = params?.courseId as string;
  const token = searchParams?.get("token");

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [course, setCourse] = useState<{
    title: string;
    department: string;
    level: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch course details
    if (courseId) {
      fetch(`/api/resources/${courseId}`)
        .then((res) => res.json())
        .then((data) => setCourse(data))
        .catch((err) => console.error("Failed to fetch course:", err));
    }
  }, [courseId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/rate/${courseId}${token ? `?token=${token}` : ""}`
        )}`
      );
    }
  }, [user, token, courseId, router]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/ratings/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: rating,
          review: review.trim() || null,
          token: token || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit rating");
      }

      setSubmitted(true);

      // Redirect to course page after 3 seconds
      setTimeout(() => {
        router.push(`/dashboard/courses?courseId=${courseId}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit rating");
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-500"
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
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">
            Your rating has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the course page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Logo" width={120} height={40} />
        </div>

        {/* Course Info */}
        {course && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {course.title}
            </h2>
            <p className="text-sm text-gray-500">
              {course.department} • {course.level}
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Rate This Course
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          How would you rate your experience with this course?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Star Rating */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-2 transition-transform hover:scale-110"
              disabled={isSubmitting}>
              <svg
                className="w-12 h-12"
                fill={(hoveredRating || rating) >= star ? "#F6C244" : "none"}
                stroke={
                  (hoveredRating || rating) >= star ? "#F6C244" : "#D1D5DB"
                }
                strokeWidth="2"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-center text-gray-600 mb-6">
            You rated this course:{" "}
            <span className="font-semibold text-[#FFB0E8]">
              {rating} / 5 stars
            </span>
          </p>
        )}

        {/* Review (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this course..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB0E8] focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full bg-[#FFB0E8] text-white font-semibold py-3 rounded-lg hover:bg-[#ff9ed8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
          {isSubmitting ? "Submitting..." : "Submit Rating"}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your feedback helps other students make informed decisions
        </p>
      </div>
    </div>
  );
}
