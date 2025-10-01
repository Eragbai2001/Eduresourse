// components/skeletons/SkeletonCourseCard.tsx
export function SkeletonCourseCard() {
  return (
    <div className="px-4 py-3 border-none bg-white rounded-xl animate-pulse">
      <div className="flex items-start w-full gap-2">
        {/* Cover photo skeleton */}
        <div className="h-[87px] w-[87px] rounded-xl bg-gray-200"></div>

        <div className="flex-grow ml-5">
          {/* Category and level skeleton */}
          <div className="flex items-center mb-2">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <span className="mx-2 text-gray-300">•</span>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>

          {/* Title skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>

          {/* Stats for desktop and tablet */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mr-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mr-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile stats skeleton */}
      <div className="md:hidden w-full flex items-center gap-3 mt-4 pt-3 pl-1 border-t-2 border-gray-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mr-1"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// components/skeletons/SkeletonCourseDetail.tsx
export function SkeletonCourseDetail() {
  return (
    <div className="bg-white rounded-xl w-full h-fit p-4 animate-pulse">
      {/* Header section */}
      <div className="mb-4">
        {/* Department and level */}
        <div className="flex items-center mb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <span className="mx-2 text-gray-300">•</span>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-32 ml-3"></div>
        </div>

        {/* Title and status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-2 mb-3">
          <div className="h-7 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Cover image skeleton */}
      <div className="mb-4 h-[200px] sm:h-[250px] md:h-[300px] lg:h-[340px] w-full bg-gray-200 rounded-md"></div>

      {/* Uploader avatar and name skeleton */}
      <div className="mt-3 flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200" />
        <div className="w-32 h-4 rounded bg-gray-200" />
      </div>

      {/* About Course section */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-8">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2 mt-0.5"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources section */}
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
