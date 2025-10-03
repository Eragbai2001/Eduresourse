"use client";

import React from "react";
import { Button } from "@/app/components/ui/button";
import {
  FileText,
  Image as ImageIcon,
  Video,
  FileCode,
  File,
  CheckCircle2,
  Trash2,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadItem {
  name: string;
  size: number;
  progress?: number;
  status?: "uploading" | "success" | "error";
}

interface FileUploadListProps {
  files: FileUploadItem[];
  onRemove: (index: number) => void;
  onRetry?: (index: number) => void;
  disabled?: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const iconClass = "h-6 w-6";

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
    return <ImageIcon className={cn(iconClass, "text-purple-500")} />;
  }
  if (["mp4", "mov", "avi", "mkv"].includes(extension || "")) {
    return <Video className={cn(iconClass, "text-purple-500")} />;
  }
  if (["pdf"].includes(extension || "")) {
    return <FileText className={cn(iconClass, "text-red-500")} />;
  }
  if (["doc", "docx"].includes(extension || "")) {
    return <FileText className={cn(iconClass, "text-blue-500")} />;
  }
  if (["fig", "sketch", "xd"].includes(extension || "")) {
    return <FileCode className={cn(iconClass, "text-green-500")} />;
  }

  return <File className={cn(iconClass, "text-gray-500")} />;
};

export function FileUploadList({
  files,
  onRemove,
  onRetry,
  disabled = false,
}: FileUploadListProps) {
  return (
    <div className="space-y-2 md:space-y-3 pb-2">
      {files.map((file, index) => {
        const progress = file.progress ?? 100;
        const status = file.status ?? "success";

        return (
          <div
            key={index}
            className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-gray-100 shadow-sm">
            {/* File info row */}
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-xs md:text-sm">
                    {file.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {status === "success" && (
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                )}
                {status === "error" && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(index)}
                    className="text-blue-600 hover:text-blue-700 text-[10px] md:text-xs h-auto py-1 px-1.5 md:px-2">
                    Try Again <RotateCw className="h-2.5 w-2.5 md:h-3 md:w-3 ml-0.5 md:ml-1" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  disabled={disabled}
                  className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-1 md:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    status === "success" && "bg-green-500",
                    status === "uploading" && "bg-purple-500",
                    status === "error" && "bg-red-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status text */}
              <div className="flex items-center justify-between mt-1.5 md:mt-2">
                <p className="text-[10px] md:text-xs text-gray-600 truncate flex-1 pr-2">
                  {status === "success" && "Upload Successful!"}
                  {status === "uploading" && "Uploading..."}
                  {status === "error" && "Upload failed! Please try again."}
                </p>
                <p className="text-[10px] md:text-xs font-medium text-gray-700 flex-shrink-0">{progress}%</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FileUploadList;
