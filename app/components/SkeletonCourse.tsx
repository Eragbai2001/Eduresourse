// components/SkeletonCourse.tsx
export default function SkeletonCourse() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header */}
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>

      {/* Cover photo */}
      <div className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[340px] bg-gray-200 rounded-md"></div>

      {/* About Course */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
