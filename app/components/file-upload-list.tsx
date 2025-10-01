"use client"

import React from "react"
import { Button } from "@/app/components/ui/button"
import { FileText, Image as ImageIcon, Video, FileCode, File, CheckCircle2, Trash2, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadItem {
  name: string
  size: number
  progress?: number
  status?: "uploading" | "success" | "error"
}

interface FileUploadListProps {
  files: FileUploadItem[]
  onRemove: (index: number) => void
  onRetry?: (index: number) => void
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase()

  const iconClass = "h-6 w-6"

  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
    return <ImageIcon className={cn(iconClass, "text-purple-500")} />
  }
  if (["mp4", "mov", "avi", "mkv"].includes(extension || "")) {
    return <Video className={cn(iconClass, "text-purple-500")} />
  }
  if (["pdf"].includes(extension || "")) {
    return <FileText className={cn(iconClass, "text-red-500")} />
  }
  if (["doc", "docx"].includes(extension || "")) {
    return <FileText className={cn(iconClass, "text-blue-500")} />
  }
  if (["fig", "sketch", "xd"].includes(extension || "")) {
    return <FileCode className={cn(iconClass, "text-green-500")} />
  }

  return <File className={cn(iconClass, "text-gray-500")} />
}

export function FileUploadList({ files, onRemove, onRetry }: FileUploadListProps) {
  return (
    <div className="space-y-3 pb-10  ">
      {files.map((file, index) => {
        const progress = file.progress ?? 100
        const status = file.status ?? "success"

        return (
          <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            {/* File info row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {status === "error" && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRetry(index)}
                    className="text-blue-600 hover:text-blue-700 text-xs h-auto py-1 px-2"
                  >
                    Try Again <RotateCw className="h-3 w-3 ml-1" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(index)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    status === "success" && "bg-green-500",
                    status === "uploading" && "bg-purple-500",
                    status === "error" && "bg-red-500",
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Status text */}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600">
                  {status === "success" && "Upload Successful!"}
                  {status === "uploading" && "Uploading..."}
                  {status === "error" && "Upload failed! Please try again."}
                </p>
                <p className="text-xs font-medium text-gray-700">{progress}%</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FileUploadList
