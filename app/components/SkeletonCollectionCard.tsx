// components/SkeletonCollectionCard.tsx
export function SkeletonCollectionCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse">
      {/* Course Cover Skeleton */}
      <div className="h-48 w-full bg-gray-200 rounded-lg"></div>

      {/* Course Content */}
      <div className="p-4">
        {/* Department and Stats Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="mb-3">
          <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Uploader Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
