"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Upload,
  FileText,
  Video,
  ImageIcon,
  File,
  ArrowRight,
  ArrowLeft,
  Building2,
  BookOpen,
  Settings,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface FormData {
  department: string;
  level: string;
  title: string;
  description: string;
  features: string[];
  resources: File[];
  coverPhoto: File | null;
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
  "Past Questions & Answers",
  "Video Lectures",
  "Study Notes",
  "Practice Exercises",
  "Reference Materials",
  "Case Studies",
  "Research Papers",
  "Interactive Content",
];

export function ResourceUploadForm() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    department: "",
    level: "",
    title: "",
    description: "",
    features: [],
    resources: [],
    coverPhoto: null,
  });

  const steps = [
    { number: 1, title: "Select Department", description: "Select department" },
    { number: 2, title: "Course Info", description: "Title & description" },
    {
      number: 3,
      title: "Features of Resources ",
      description: "Course features",
    },
    { number: 4, title: " upload Resources", description: "Upload files" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetStarted = () => {
    setCurrentStep(1);
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
      // Upload cover photo if provided
      let coverPhotoPath: string | null = null;
      if (formData.coverPhoto) {
        const { data: coverData, error: coverError } = await supabase.storage
          .from("cover-photos")
          .upload(
            `covers/${user.id}/${Date.now()}-${formData.coverPhoto.name}`,
            formData.coverPhoto
          );

        if (coverError) {
          toast.error("Cover photo upload failed: " + coverError.message);
          setLoading(false);
          return;
        }
        coverPhotoPath = coverData.path;
      }

      // Upload files to Supabase Storage and collect their paths
      const uploadedFiles: string[] = [];
      for (const file of formData.resources) {
        const { data, error } = await supabase.storage
          .from("resources")
          .upload(`resources/${user.id}/${Date.now()}-${file.name}`, file);

        if (error) {
          toast.error("File upload failed: " + error.message);
          setLoading(false);
          return;
        }
        uploadedFiles.push(data.path);
      }

      // Filter out the cover photo from resources (if user uploaded the same file as both)
      const filteredResources = formData.resources.filter(
        (file) =>
          !(
            formData.coverPhoto &&
            file.name === formData.coverPhoto.name &&
            file.size === formData.coverPhoto.size
          )
      );

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
        resourceCount: filteredResources.length, // number of files (excluding cover photo)
        downloadCount: 0, // always 0 on creation
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
      });
      setCurrentStep(0);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

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

  const handleCoverPhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({
        ...prev,
        coverPhoto: file,
      }));
    } else {
      toast.error("Please select an image file for the cover photo.");
    }
  };
  return (
    <div className="min-h-[80vh] bg-[#F5F8FF]  font-hanken">
      {currentStep === 0 && (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center  mx-auto">
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
        <div className="min-h-[80vh] md:min-h-[80vh] bg-[#F5F8FF] flex items-center justify-center p-2 md:p-8">
          <div className="w-full max-w-[500px] sm:max-w-md md:max-w-6xl mx-auto">
            <div className="rounded-xl md:rounded-2xl overflow-hidden flex flex-col md:flex-row  md:h-[700px] md:bg-[#FFB0E8]">
              {/* Left side - Form content */}

              <div className="flex-1 rounded-tr-2xl rounded-br-2xl md:rounded-tr-2xl md:rounded-br-2xl bg-white">
                <div className="flex-1 p-4 md:p-6 lg:p-12 overflow-y-auto flex flex-col justify-between h-full min-h-[350px] md:min-h-[500px]">
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                        <span className="text-3xl md:text-5xl font-bold text-[#FFB0E8]">
                          {currentStep}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-4xl">
                      {/* Step 1: Department Selection */}
                      {currentStep === 1 && (
                        <div className="space-y-8 text-center">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                              Which department is this for?
                            </h2>
                            <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                              Select the academic department for your
                              educational resources
                            </p>
                          </div>

                          <div className="space-y-6 max-w-md mx-auto">
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
                      )}

                      {/* Step 2: Course Information */}
                      {currentStep === 2 && (
                        <div className="div">
                          <div className="space-y-1 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                              Tell us about your course
                            </h2>
                            <p className="text-gray-600 mb-8">
                              Provide a title and description for your
                              educational resources
                            </p>
                          </div>
                          <div className="flex flex-col gap-8 md:gap-0 md:flex-row  items-start justify-start md:justify-center overflow-y-hidden ">
                            {/* Right: Cover Photo Upload (Mobile) */}
                            <div className="flex-1 max-w-sm md:pl-8 flex flex-col items-center md:items-end justify-center h-[220px] md:hidden">
                              <Label className="text-base font-medium text-gray-700 mb-2 block">
                                Cover Photo (optional)
                              </Label>
                              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-2 text-center hover:border-[#FFB0E8] transition-colors group h-[120px] w-[120px] flex items-center justify-center">
                                {formData.coverPhoto ? (
                                  <>
                                    <Image
                                      src={URL.createObjectURL(
                                        formData.coverPhoto
                                      )}
                                      alt="Cover preview"
                                      width={87}
                                      height={87}
                                      className="h-[87px] w-[87px] object-cover rounded-lg"
                                      style={{ objectFit: "cover" }}
                                      unoptimized // Needed for local blob URLs
                                    />
                                    {/* Trash button absolutely positioned */}
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
                                  <div className="flex flex-col items-center justify-center h-full w-full">
                                    <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-[#FFB0E8] mb-1 transition-colors" />
                                    <p className="text-xs font-semibold text-gray-700">
                                      Upload
                                    </p>
                                    <p className="text-[10px] text-gray-500">
                                      JPG, PNG, GIF
                                    </p>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleCoverPhotoUpload}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
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
                                  placeholder="e.g., Advanced Data Structures and Algorithms"
                                  value={formData.title}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      title: e.target.value,
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
                                  Cover Photo (optional)
                                </Label>
                                <div
                                  className={cn(
                                    "relative rounded-xl p-2 text-center transition-colors group h-[160px] w-[160px] flex items-center justify-center  ",
                                    formData.coverPhoto
                                      ? "" // No border when image is selected
                                      : "border-2 border-dashed border-gray-300 hover:border-[#FFB0E8] "
                                  )}>
                                  {formData.coverPhoto ? (
                                    <>
                                      <Image
                                        src={URL.createObjectURL(
                                          formData.coverPhoto
                                        )}
                                        alt="Cover preview"
                                        width={87}
                                        height={87}
                                        className="h-[87px] w-[87px] object-cover rounded-lg"
                                        style={{ objectFit: "cover" }}
                                        unoptimized
                                      />
                                      {/* Trash button absolutely positioned */}
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
                                    <div className="flex flex-col items-center justify-center h-full w-full">
                                      <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-[#FFB0E8] mb-1 transition-colors" />
                                      <p className="text-xs font-semibold text-gray-700">
                                        Upload
                                      </p>
                                      <p className="text-[10px] text-gray-500">
                                        JPG, PNG, GIF
                                      </p>
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverPhotoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Features */}
                      {currentStep === 3 && (
                        <div className="space-y-8 text-center">
                          <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                              What type of resources are you sharing?
                            </h2>
                            <p className="text-gray-600 mb-8">
                              Select all that apply to help students find what
                              they need
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {availableFeatures.map((feature) => (
                              <div
                                key={feature}
                                className={cn(
                                  "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                                  formData.features.includes(feature)
                                    ? "border-[#FFB0E8] bg-[#FFB0E8]/10"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                                onClick={() => handleFeatureToggle(feature)}>
                                <Checkbox
                                  checked={formData.features.includes(feature)}
                                  className="data-[state=checked]:bg-[#FFB0E8] data-[state=checked]:border-[#FFB0E8] focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <span className="text-base font-medium text-gray-900">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 4: File Upload */}
                      {currentStep === 4 && (
                        <div className="space-y-8 text-center">
                          <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                              Upload your files
                            </h2>
                            <p className="text-gray-600 mb-8">
                              Share your educational materials with the
                              community
                            </p>
                          </div>

                          <div className="max-w-2xl mx-auto">
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#FFB0E8] transition-colors group">
                              <Upload className="h-16 w-16 text-gray-400 group-hover:text-[#FFB0E8] mx-auto mb-6 transition-colors" />
                              <div className="space-y-2">
                                <p className="text-xl font-semibold text-gray-700">
                                  Drop files here or click to browse
                                </p>
                                <p className="text-gray-500">
                                  Supports PDF, DOC, PPT, MP4, JPG, PNG and more
                                </p>
                              </div>
                              <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>

                            {formData.resources.length > 0 && (
                              <div className="mt-6 space-y-3">
                                {formData.resources.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-3">
                                      {getFileIcon(file.name)}
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {file.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                          MB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="text-red-500 hover:text-red-700">
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex justify-between items-center mt-12 pt-8 sticky bottom-0 bg-white py-4">
                    <Button
                      variant="ghost"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </Button>

                    {currentStep < 4 ? (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className="flex items-center space-x-2 h-12 px-8 bg-[#FFB0E8] hover:bg-[#FFB0E8]/90 text-white/90 font-medium rounded-xl disabled:opacity-50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 text-xl">
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        disabled={!isStepValid() || loading}
                        className="h-12 px-8 bg-[#FFB0E8] hover:bg-[#FFB0E8]/90 text-white/90  font-medium rounded-xl disabled:opacity-50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                        onClick={handleSubmit}>
                        {loading ? "Uploading..." : "Upload Resources"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Steps navigation (vertical sidebar) */}
              <div className="hidden md:flex w-48 bg-[#FFB0E8] h-full relative">
                <div className="h-full flex w-full">
                  {steps
                    .filter((step) => step.number !== currentStep) // Hide current step
                    .map((step) => (
                      <div
                        key={step.number}
                        className={cn(
                          "w-16 flex flex-col items-center pt-6 pb-12 border-r border-white rounded-r-xl relative",
                          currentStep > step.number
                            ? "bg-[#FFB0E8]"
                            : "bg-[#FFB0E8]"
                        )}>
                        {/* Number at top */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-3xl font-bold mb-6",
                            currentStep > step.number
                              ? " text-white"
                              : "text-white"
                          )}>
                          {step.number}
                        </div>

                        {/* Title - vertical */}
                        <div className="flex-1 flex items-end justify-center pb-8">
                          <div className="text-2xl font-medium text-white whitespace-nowrap [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
                            {step.title.toLowerCase()}
                          </div>
                        </div>

                        {/* Icon at bottom */}
                        <div className="w-10 h-10  rounded-full bg-white flex items-center justify-center absolute bottom-4">
                          {step.number === 1 && (
                            <Building2 className="w-4 h-4 text-[#FFB0E8]" />
                          )}
                          {step.number === 2 && (
                            <BookOpen className="w-4 h-4 text-[#FFB0E8]" />
                          )}
                          {step.number === 3 && (
                            <Settings className="w-4 h-4 text-[#FFB0E8]" />
                          )}
                          {step.number === 4 && (
                            <Upload className="w-4 h-4 text-[#FFB0E8]" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
