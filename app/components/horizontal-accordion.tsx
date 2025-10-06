"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BookOpen,
  Settings,
  Upload,
  Trash,
} from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import FileUploadList from "@/app/components/file-upload-list";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
  // Narrow icon type to an SVG React element so we can safely clone it with className
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  number: number;
  color: {
    bg: string;
    text: string;
    button: string;
  };
}

const levels = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "500 Level",
];

const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Engineering",
  "Business Administration",
  "Economics",
  "Psychology",
  "Literature",
];

const availableFeatures = [
  "Lecture Notes",
  "Practice Problems",
  "Video Tutorials",
  "Lab Materials",
  "Study Guides",
  "Assignments",
  "Quizzes",
  "Reference Materials",
];

export function HorizontalAccordion() {
  const [activeSection, setActiveSection] = useState<string>("section-1");

  // ...existing code...

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const COVER_COLORS = React.useMemo(
    () => [
      "#F2BC33",
      "#F9C952",
      "#FFD365",
      "#FFDC85",
      "#FFE7A9",
      "#FFEFC8",
      "#FFEFC8",
      "#FFF8E6",
      "#F588D6",
      "#FD98E0",
      "#FFB0E8",
      "#FFC2ED",
      "#FFD6F3",
      "#FFE3F7",
      "#FFEEFA",
      "#9FB9EB",
      "#B7CEF9",
      "#BFD5FF",
      "#CDDEFF",
      "#DBE7FF",
      "#E8F0FF",
    ],
    []
  );
  function getRandomCoverColor() {
    return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
  }
  // typed form state for the upload flow
  interface ResourceFormState {
    department: string;
    level: string;
    title: string;
    description: string;
    features: string[];
    resources: File[];
    coverPhoto: File | null;
    coverColor: string;
  }

  const [formData, setFormData] = useState<ResourceFormState>({
    department: "",
    level: "",
    title: "",
    description: "",
    features: [],
    resources: [],
    coverPhoto: null,
    // do not call Math.random()/getRandomCoverColor during render (SSR) to avoid
    // hydration mismatches. Set it client-side in useEffect below.
    coverColor: "",
  });

  // steps helper removed — navigation controlled by currentStep/activeSection

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  // Set a random cover color on mount only (client-side) to avoid SSR/client
  // mismatch caused by Math.random() returning different values.
  // set a client-only random cover color. COVER_COLORS is static so this effect
  // will only run once; we include COVER_COLORS in deps to satisfy lint.
  useEffect(() => {
    const color = COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
    setFormData((prev) => ({ ...prev, coverColor: color }));
  }, [COVER_COLORS]);

  // currentStep-only handlers removed; navigation is handled via section-based handlers below

  const handleGetStarted = () => {
    setCurrentStep(1);
    setActiveSection("section-1");
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const MAX_FILE_SIZE_MB = 50;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const tooLarge = files.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (tooLarge) {
      toast.error(`File "${tooLarge.name}" exceeds the 50MB limit.`);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, ...files],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      // Cover photo uploads are disabled; we do not upload or include a cover photo
      const coverPhotoPath: string | null = null;

      // Upload files to Supabase Storage and collect their paths
      const uploadedFiles: string[] = [];
      for (const file of formData.resources) {
        const { data, error } = await supabase.storage
          .from("resources")
          .upload(`resources/${user.id}/${Date.now()}-${file.name}`, file, {
            contentType: file.type, // 👈 This ensures proper MIME type is set
          });

        if (error) {
          toast.error("File upload failed: " + error.message);
          setLoading(false);
          return;
        }
        uploadedFiles.push(data.path);
      }

      // No cover photo selection, so filtered resources are the same as uploaded
      const filteredResources = formData.resources;

      // Prepare data for Prisma API
      const dataToInsert = {
        userId: user.id,
        department: formData.department,
        level: formData.level,
        title: formData.title,
        description: formData.description,
        features: formData.features,
        files: uploadedFiles,
        coverPhoto: coverPhotoPath,
        coverColor: formData.coverColor, // Include the cover color
        resourceCount: filteredResources.length,
        downloadCount: 0,
      };

      // Call your API route
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToInsert),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(
          "Error saving data: " + (result.error || response.statusText)
        );
        setLoading(false);
        return;
      }

      toast.success("Resources uploaded successfully!");
      setFormData({
        department: "",
        level: "",
        title: "",
        description: "",
        features: [],
        resources: [],
        coverPhoto: null,
        coverColor: getRandomCoverColor(),
      });
      setCurrentStep(0);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // file icon rendering moved to a reusable component (FileUploadList)

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.department !== "" && formData.level !== "";
      case 2:
        return formData.title !== "" && formData.description !== "";
      case 3:
        return formData.features.length > 0;
      case 4:
        return formData.resources.length > 0;
      default:
        return false;
    }
  };

  const sections: Section[] = [
    {
      id: "section-1",
      title: "Department",
      number: 1,
      content: (
        <div className="space-y-4 md:space-y-8 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Which department is this for?
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-6 lg:mb-8 px-2">
              Select the academic department for your educational resources
            </p>
          </div>

          <div className="space-y-4 md:space-y-6 max-w-md mx-auto">
            <div>
              <Label
                htmlFor="department"
                className="text-base font-medium text-gray-700 mb-2 block">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    department: value,
                  }))
                }>
                <SelectTrigger
                  id="department"
                  className="w-full h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8] focus-visible:border-[#FFB0E8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-colors shadow-none">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent className="bg-white   border-2 border-gray-200">
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept}
                      value={dept}
                      className="text-base py-3  ">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="level"
                className="text-base font-medium text-gray-700 mb-2 block">
                Course Level
              </Label>
              <Select
                value={formData.level}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    level: value,
                  }))
                }>
                <SelectTrigger
                  id="level"
                  className="w-full h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8] focus-visible:border-[#FFB0E8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none transition-colors shadow-none">
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent className="bg-white   border-2 border-gray-200 ">
                  {levels.map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="text-base py-3  ">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ),
      icon: <Building2 className="w-4 h-4" />,
      color: {
        bg: "bg-[#FFB0E8]",
        text: "text-[#FFB0E8]",
        button: "text-[#FFB0E8] border-[#FFB0E8]",
      },
    },
    {
      id: "section-2",
      title: "Course Info",
      number: 2,
      content: (
        <div className="px-2 md:px-6 lg:px-12">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Tell us about your course
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8 px-2">
              Provide a title and description for your educational resources
            </p>
          </div>
          <div className="flex flex-col gap-8 md:gap-0 md:flex-row  items-start justify-start md:justify-center overflow-y-hidden ">
            {/* Cover photo selection disabled - no preview or upload allowed */}
            <div className="flex-1 max-w-sm md:pl-8 flex flex-col items-center md:items-end justify-center h-[120px] md:hidden">
              <Label className="text-base font-medium text-gray-700 mb-2 block">
                Cover Photo
              </Label>
              <div
                className={cn(
                  "relative rounded-xl p-2 text-center transition-colors group flex items-center justify-center",
                  // Responsive sizing: smaller on mobile, larger on md+
                  "h-[120px] w-[120px] md:h-[190px] md:w-[190px]",
                  formData.coverPhoto ? "" : " hover:border-[#FFB0E8]"
                )}
                style={{
                  background: !formData.coverPhoto
                    ? formData.coverColor || undefined
                    : undefined,
                }}>
                {formData.coverPhoto ? (
                  <>
                    <Image
                      src={URL.createObjectURL(formData.coverPhoto)}
                      alt="Cover preview"
                      width={190}
                      height={190}
                      unoptimized
                      className="h-[120px] w-[120px] md:h-[190px] md:w-[190px] object-cover rounded-lg border-2 border-gray-300"
                      style={{ objectFit: "cover" }}
                    />
                    {/* Trash button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({
                          ...prev,
                          coverPhoto: null,
                        }));
                      }}
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10 flex items-center"
                      aria-label="Remove cover photo">
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </>
                ) : (
                  <span className="text-3xl md:text-5xl font-bold text-white select-none">
                    {(formData.title || "TITLE").slice(0, 6).toUpperCase()}
                  </span>
                )}
                {/* cover upload input removed (disabled) */}
              </div>
            </div>
            {/* Left: Course Info */}
            <div className="flex-1 space-y-7 max-w-xl w-full  ">
              <div>
                <Label
                  htmlFor="title"
                  className="text-base font-medium text-gray-700 mb-2 block">
                  Course Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., CSC201-Data Structures and Algorithms"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                      // Only pick a new color if no cover photo is selected
                      coverColor: prev.coverPhoto
                        ? prev.coverColor
                        : getRandomCoverColor(),
                    }))
                  }
                  className="shadow-none   w-full h-14 text-lg border-2 border-gray-200 rounded-xl !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:ring-transparent !focus-visible:border-gray-300 !focus:border-gray-300 !focus:outline-none !focus:ring-0 !focus:ring-offset-0 transition-colors focus:border-[#FFB0E8] "
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className=" w-full text-base font-medium text-gray-700 mb-2 block">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn and what makes these resources valuable..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className=" shadow-none min-h-[120px] text-base border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8] transition-colors resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            <div
              className="flex 
                                 ">
              {/* Right: Cover Photo Upload */}
              <div className="flex-1 max-w-sm mx-auto md:mx-0 md:ml-auto md:pl-8  flex-col items-center md:items-end justify-center h-[220px] hidden md:flex  ">
                <Label className="text-base font-medium text-gray-700 mb-2 w-full text-left">
                  Cover Photo
                </Label>
                <div
                  className={cn(
                    "relative rounded-xl p-2 text-center transition-colors group h-[260px] w-[260px] flex items-center justify-center",
                    formData.coverPhoto ? "" : " hover:border-[#FFB0E8]"
                  )}
                  style={{
                    background: !formData.coverPhoto
                      ? formData.coverColor || undefined
                      : undefined,
                  }}>
                  {formData.coverPhoto ? (
                    <>
                      <Image
                        src={URL.createObjectURL(formData.coverPhoto)}
                        alt="Cover preview"
                        width={260}
                        height={260}
                        unoptimized
                        className="h-[260px] w-[260px] object-cover rounded-lg border-2 border-gray-300"
                        style={{ objectFit: "cover" }}
                      />
                      {/* Trash button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            coverPhoto: null,
                          }));
                        }}
                        className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10 flex items-center"
                        aria-label="Remove cover photo">
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    </>
                  ) : (
                    <span className="text-5xl font-bold text-white select-none">
                      {(formData.title || "TITLE").slice(0, 6).toUpperCase()}
                    </span>
                  )}
                  {/* cover upload input removed (disabled) */}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: <BookOpen className="w-4 h-4" />,
      color: {
        bg: "bg-[#FFB0E8]",
        text: "text-[#FFB0E8]",
        button: "text-[#FFB0E8] border-[#FFB0E8]",
      },
    },
    {
      id: "section-3",
      title: "Features",
      number: 3,
      content: (
        <div className="space-y-4 md:space-y-8 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              What type of resources are you sharing?
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8 px-2">
              Select all that apply to help students find what they need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-3xl mx-auto">
            {availableFeatures.map((feature) => (
              <div
                key={feature}
                className={cn(
                  "flex items-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-lg md:rounded-xl border-2 cursor-pointer transition-all duration-200",
                  formData.features.includes(feature)
                    ? "border-[#FFB0E8] bg-[#FFB0E8]/10"
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => handleFeatureToggle(feature)}>
                <Checkbox
                  checked={formData.features.includes(feature)}
                  className="data-[state=checked]:bg-[#FFB0E8] data-[state=checked]:border-[#FFB0E8] focus-visible:ring-0 focus-visible:ring-offset-0 flex-shrink-0"
                />
                <span className="text-sm md:text-base font-medium text-gray-900 text-left">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      icon: <Settings className="w-4 h-4" />,
      color: {
        bg: "bg-[#FFB0E8]",
        text: "text-[#FFB0E8]",
        button: "text-[#FFB0E8] border-[#FFB0E8]",
      },
    },
    {
      id: "section-4",
      title: "Upload",
      number: 4,
      content: (
        <div className="space-y-4 md:space-y-8 text-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">
              Upload your files
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-8 px-2">
              Share your educational materials with the community
            </p>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col md:h-[260px] pb-0 px-2 md:px-0">
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg md:rounded-xl p-4 md:p-8 lg:p-12 text-center hover:border-[#FFB0E8] transition-colors group">
              <Upload className="h-7 w-7 md:h-14 md:w-14 lg:h-16 lg:w-16 text-gray-400 group-hover:text-[#FFB0E8] mx-auto mb-1.5 md:mb-5 lg:mb-6 transition-colors" />
              <div className="space-y-0.5 md:space-y-2">
                <p className="text-xs md:text-lg lg:text-xl font-semibold text-gray-700 leading-tight">
                  Drop files or browse
                </p>
                <p className="text-[10px] md:text-sm text-gray-500 px-1 leading-tight">
                  PDF, DOC, PPT, MP4, JPG, PNG
                </p>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={loading}
                className={cn(
                  "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
                  loading && "cursor-not-allowed"
                )}
              />
              {/* Optional: Overlay to show disabled state */}
              {loading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                  <span className="text-sm md:text-lg font-semibold text-gray-400">
                    Uploading...
                  </span>
                </div>
              )}
            </div>

            {formData.resources.length > 0 && (
              <div className="mt-2 md:mt-5 lg:mt-6 mb-0 md:mb-6 lg:mb-8 px-2 md:px-0">
                {/* Map File objects to the FileUploadList shape */}
                <FileUploadList
                  files={formData.resources.map((f) => ({
                    name: f.name,
                    size: f.size,
                    progress: 100,
                    status: "success",
                  }))}
                  onRemove={removeFile}
                  disabled={loading}
                  onRetry={(index: number) => {
                    const file = formData.resources[index];
                    toast.error(
                      `Retry upload for "${
                        file?.name ?? "file"
                      }" is not implemented yet.`
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ),
      icon: <Upload className="w-4 h-4" />,
      color: {
        bg: "bg-[#FFB0E8]",
        text: "text-[#FFB0E8]",
        button: "text-[#FFB0E8] border-[#FFB0E8]",
      },
    },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (sectionId === activeSection) return;

    const targetIndex = sections.findIndex((s) => s.id === sectionId);
    if (targetIndex === -1) return;
    const targetStep = targetIndex + 1; // 1-based

    // allow going back freely
    if (targetStep <= currentStep) {
      setActiveSection(sectionId);
      setCurrentStep(targetStep);
      return;
    }

    // allow moving to step 1 from initial state
    if (currentStep === 0 && targetStep === 1) {
      setActiveSection(sectionId);
      setCurrentStep(1);
      return;
    }

    // moving forward: require current step to be valid
    if (!isStepValid()) {
      toast.error("Please complete the current step before moving on.");
      return;
    }

    setActiveSection(sectionId);
    setCurrentStep(targetStep);
  };

  const handlePrevious = () => {
    const currentIndex = sections.findIndex(
      (section) => section.id === activeSection
    );
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setActiveSection(sections[newIndex].id);
      // sync step (1-based)
      setCurrentStep(newIndex + 1);
    }
  };

  const handleNext = () => {
    // Prevent moving forward unless current step is valid
    if (!isStepValid()) {
      toast.error("Please complete the current step before moving on.");
      return;
    }

    const currentIndex = sections.findIndex(
      (section) => section.id === activeSection
    );
    if (currentIndex < sections.length - 1) {
      const newIndex = currentIndex + 1;
      setActiveSection(sections[newIndex].id);
      // sync step (1-based)
      setCurrentStep(newIndex + 1);
    }
  };

  // currentIndex removed (unused)

  // mounted becomes true shortly after first render so we can run a one-time "slide" animation
  const [mounted, setMounted] = useState(false);
  // sequencing: slide animation (0.3s) should finish before the content reveal (max-height/opacity) begins
  const [showContent, setShowContent] = useState(false);
  const [initialAnimating, setInitialAnimating] = useState(true);
  const MOUNT_DELAY = 50; // ms before starting slide (reduced from 80)
  const SLIDE_DURATION = 300; // ms matches .animate { animation: slide 0.3s }

  // Initial sequencing on mount: start slide, then reveal content after slide completes
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      const t2 = setTimeout(() => {
        setShowContent(true);
        setInitialAnimating(false);
      }, SLIDE_DURATION);
      // cleanup nested timeout
      return () => clearTimeout(t2);
    }, MOUNT_DELAY);

    return () => clearTimeout(t);
  }, []);

  // On subsequent section changes, run the slide animation then reveal content.
  useEffect(() => {
    if (initialAnimating) return;

    // hide content immediately, re-trigger animate by toggling mounted
    setShowContent(false);
    setMounted(false);

    // small reflow delay before re-enabling mounted so CSS animation restarts
    const start = setTimeout(() => setMounted(true), 20);

    const reveal = setTimeout(() => {
      setShowContent(true);
    }, 20 + SLIDE_DURATION);

    return () => {
      clearTimeout(start);
      clearTimeout(reveal);
    };
  }, [activeSection, initialAnimating]);

  return (
    <>
      {currentStep === 0 && (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F5F8FF]">
          <div className="text-center mx-auto px-4">
            <div className="mb-8">
              <Image
                src="/logo.png"
                alt="Coursify Logo"
                width={80}
                height={80}
                className="mx-auto mb-6"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Share Your Knowledge
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Upload educational resources to help fellow students succeed in
              their academic journey
            </p>
            <Button
              onClick={handleGetStarted}
              className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors duration-200">
              Get Started
            </Button>
          </div>
        </div>
      )}

      {currentStep > 0 && (
        <div className="min-h-[80vh] md:min-h-[80vh] bg-[#F5F8FF] flex items-center justify-center px-4 md:px-8">
          {/* Outer wrapper: on md use pink background and large rounded container so active white panel can show pink curved corners */}
          <div className="rounded-xl md:rounded-2xl overflow-hidden mx-auto xl:bg-[#FFB0E8] w-full max-w-5xl  md:h-[590px] lg:h-[590px] xl:h-[640px]">
            <div className="flex flex-row items-stretch h-full">
              {sections.map((section, index) => {
                const isActive = activeSection === section.id;

                return (
                  <div
                    key={section.id}
                    className={cn(
                      "cursor-pointer transition-all duration-500 ease-in-out relative",
                      isActive
                        ? "flex-[5] bg-white rounded-tr-2xl rounded-br-2xl md:rounded-tr-2xl md:rounded-br-2xl"
                        : `hidden xl:flex xl:w-16 xl:flex-none ${section.color.bg}`,
                      index < sections.length - 1 && "border-r border-white/40"
                    )}
                    role="tabpanel"
                    aria-labelledby={section.title}
                    onClick={() => handleSectionClick(section.id)}>
                    <div
                      className={cn(
                        "flex",
                        isActive
                          ? "flex-row justify-end"
                          : "flex-col items-center"
                      )}>
                      <div
                        className={cn(
                          "w-10 h-10 m-0 p-0 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-2xl",
                          isActive
                            ? `${section.color.text} m-5 mt-5 mr-5 mb-0 ml-5`
                            : "text-white mt-5 mx-0 mb-3 ml-0"
                        )}
                        aria-label={`Step ${section.number}: ${section.title}`}>
                        {section.number}
                      </div>
                    </div>

                    {/* Vertical title centered in narrow non-active tabs */}
                    {!isActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-white whitespace-nowrap [writing-mode:vertical-rl] [text-orientation:mixed]">
                          {section.title}
                        </span>
                      </div>
                    )}

                    {isActive && (
                      <h3
                        className={cn(
                          "text-2xl font-bold transition-all duration-500  hidden md:block ",
                          section.color.text,
                          "py-3 px-0 pl-5"
                        )}>
                        {section.title}
                      </h3>
                    )}

                    <div
                      className={cn(
                        "overflow-y-auto overflow-x-hidden transition-all duration-700 ease-out",
                        // increase max height so content (file list) isn't clipped
                        // Use different heights for upload section (section-4) to accommodate file list
                        isActive && showContent
                          ? section.id === "section-4"
                            ? "max-h-[calc(100vh-280px)] md:max-h-[720px] opacity-100"
                            : "max-h-[720px] opacity-100"
                          : "max-h-0 opacity-0"
                      )}>
                      <div
                        className={cn(
                          // extra bottom padding on small screens so the fixed nav doesn't cover content
                          // Add horizontal padding on mobile for better spacing
                          // Adjust padding for upload section to give more room for file list
                          "cursor-text text-gray-600 pt-4 md:pt-6",
                          section.id === "section-4"
                            ? "pb-16 md:pb-16 lg:pb-16 px-3 md:px-0"
                            : "pb-20 md:pb-16 lg:pb-6 px-4 ",
                          !isActive && "invisible opacity-0 pointer-events-none"
                        )}>
                        <div
                          className={cn(
                            isActive && mounted && showContent && "animate"
                          )}>
                          <div
                            className={
                              section.id === "section-3" ? "mb-4" : undefined
                            }>
                            {section.content}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isActive && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                          {React.cloneElement(
                            section.icon as React.ReactElement<
                              React.SVGProps<SVGSVGElement>
                            >,
                            {
                              className: "w-4 h-4 text-[#FFB0E8]",
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* Navigation controls: positioned at the bottom of the parent section and animated */}
                    <div
                      className={cn(
                        "absolute left-0 right-0 bottom-0 px-4 md:px-6 pb-4 md:pb-6 transition-all duration-500 ease-in-out bg-white border-t border-gray-100 md:border-0",
                        isActive
                          ? "translate-y-0 opacity-100 pointer-events-auto"
                          : "translate-y-6 opacity-0 pointer-events-none"
                      )}>
                      <div className="flex justify-between items-center bg-white pt-2 md:pt-0">
                        <Button
                          variant="ghost"
                          onClick={handlePrevious}
                          disabled={currentStep === 1}
                          className="flex items-center space-x-1 md:space-x-2 text-sm md:text-base text-gray-600 hover:text-gray-900 disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 md:h-10 px-3 md:px-4">
                          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                          <span>Back</span>
                        </Button>

                        {currentStep < 4 ? (
                          <Button
                            onClick={handleNext}
                            disabled={!isStepValid() || loading}
                            className="flex items-center space-x-1 md:space-x-2 h-9 md:h-10 px-4 md:px-6 text-sm md:text-base bg-[#FFB0E8] hover:bg-[#FFB0E8]/90 text-white rounded-xl disabled:opacity-50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0">
                            <span>Next</span>
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        ) : (
                          <Button
                            disabled={!isStepValid() || loading}
                            className="flex items-center justify-center space-x-1 md:space-x-2 h-9 md:h-10 px-2 md:px-5 text-[11px] md:text-base bg-[#FFB0E8] hover:bg-[#FFB0E8]/90 text-white rounded-xl disabled:opacity-50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 whitespace-nowrap"
                            onClick={handleSubmit}>
                            <span className="truncate">
                              {loading ? "Uploading..." : "Upload Resources"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
