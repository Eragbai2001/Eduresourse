import React from "react";
import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea"; // adjust imports to your project
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Upload, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  department: string;
  level: string;
  title: string;
  description: string;
  features: string[];
  files: File[];
  coverPhoto: File | null;
  coverColor: string;
}

export interface StepDetailProps {
  step: number;
  interactive?: boolean;
  formData: FormData;
  setFormData: (fn: (prev: FormData) => FormData) => void;
  departments: string[];
  levels: string[];
  availableFeatures: string[];
  handleFeatureToggle: (feature: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  loading: boolean;
  getRandomCoverColor: () => string;
  getFileIcon: (fileName: string) => React.ReactNode;
}

export default function StepDetail({
  step,
  interactive = true,
  formData,
  setFormData,
  departments,
  levels,
  availableFeatures,
  handleFeatureToggle,
  handleFileUpload,
  removeFile,
  loading,
  getRandomCoverColor,
  getFileIcon,
}: StepDetailProps) {
  const wrapperCls = interactive ? "" : "pointer-events-none select-none";

  switch (step) {
    case 1:
      return (
        <div className={wrapperCls}>
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Which department is this for?
              </h2>
              <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
                Select the academic department for your educational resources
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
                    setFormData((prev: FormData) => ({
                      ...prev,
                      department: value,
                    }))
                  }>
                  <SelectTrigger
                    id="department"
                    className="w-full h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8]">
                    <SelectValue placeholder="Select department..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200">
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}
                        className="text-base py-3">
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
                    setFormData((prev: FormData) => ({ ...prev, level: value }))
                  }>
                  <SelectTrigger
                    id="level"
                    className="w-full h-14 text-lg border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8]">
                    <SelectValue placeholder="Select level..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200">
                    {levels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level}
                        className="text-base py-3">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div className={wrapperCls}>
          <div className="space-y-1 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tell us about your course
            </h2>
            <p className="text-gray-600 mb-8">
              Provide a title and description for your educational resources
            </p>
          </div>

          <div className="flex flex-col gap-8 md:gap-0 md:flex-row items-start justify-start md:justify-center overflow-y-hidden">
            <div className="flex-1 space-y-7 max-w-xl w-full">
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
                    setFormData((prev: FormData) => ({
                      ...prev,
                      title: e.target.value,
                      coverColor: prev.coverPhoto
                        ? prev.coverColor
                        : getRandomCoverColor(),
                    }))
                  }
                  className="w-full h-14 text-lg border-2 border-gray-200 rounded-xl transition-colors focus:border-[#FFB0E8]"
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="w-full text-base font-medium text-gray-700 mb-2 block">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev: FormData) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px] border-2 border-gray-200 rounded-xl focus:border-[#FFB0E8]"
                />
              </div>
            </div>

            {/* Desktop placeholder (cover disabled) */}
            <div className="flex-1 max-w-sm mx-auto md:mx-0 md:ml-auto md:pl-8 flex-col items-center md:items-end justify-center h-[220px] hidden md:flex">
              <Label className="text-base font-medium text-gray-700 mb-2 w-full text-left">
                Cover Photo
              </Label>
              <div
                className={cn(
                  "relative rounded-xl p-2 text-center group h-[260px] w-[260px] flex items-center justify-center",
                  formData.coverPhoto ? "" : " hover:border-[#FFB0E8]"
                )}
                style={{
                  background: !formData.coverPhoto
                    ? formData.coverColor
                    : undefined,
                }}>
                {formData.coverPhoto ? (
                  <>
                    <Image
                      src={URL.createObjectURL(formData.coverPhoto)}
                      alt="Cover preview"
                      width={180}
                      height={180}
                      className="h-[260px] w-[260px] object-cover rounded-lg border-2 border-gray-300"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                    {interactive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev: FormData) => ({
                            ...prev,
                            coverPhoto: null,
                          }));
                        }}
                        className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow hover:bg-white z-10 flex items-center"
                        aria-label="Remove cover photo">
                        <Trash className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-5xl font-bold text-white select-none">
                    {(formData.title || "TITLE").slice(0, 6).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 3:
      return (
        <div className={wrapperCls}>
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What type of resources are you sharing?
              </h2>
              <p className="text-gray-600 mb-8">
                Select all that apply to help students find what they need
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
                  onClick={() => interactive && handleFeatureToggle(feature)}>
                  <Checkbox
                    checked={formData.features.includes(feature)}
                    className="data-[state=checked]:bg-[#FFB0E8]"
                  />
                  <span className="text-base font-medium text-gray-900">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className={wrapperCls}>
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Upload your files
              </h2>
              <p className="text-gray-600 mb-8">
                Share your educational materials with the community
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#FFB0E8] transition-colors group">
                <Upload className="h-16 w-16 text-gray-400 group-hover:text-[#FFB0E8] mx-auto mb-6" />
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
                  onChange={interactive ? handleFileUpload : undefined}
                  disabled={loading}
                  className={cn(
                    "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
                    loading && "cursor-not-allowed"
                  )}
                />
                {loading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                    <span className="text-lg text-gray-400">Uploading...</span>
                  </div>
                )}
              </div>

              {formData.files.length > 0 && (
                <div className="mt-6 space-y-3">
                  {formData.files.map((file: File, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="flex items-end">
                          {getFileIcon(file.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {interactive ? (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700">
                          Remove
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
