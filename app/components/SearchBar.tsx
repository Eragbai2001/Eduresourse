"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResource {
  id: string;
  title: string;
  description: string;
  department: string;
  level: string;
  coverPhoto: string | null;
  coverColor: string | null;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  averageRating?: number;
  ratingCount?: number;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  focusRingColor?: string;
  onResultClick?: () => void; // Callback when a result is clicked
}

export default function SearchBar({
  placeholder = "Search resources...",
  className = "",
  inputClassName = "",
  focusRingColor = "focus:ring-purple-200",
  onResultClick,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data.resources) {
        // Fetch ratings for each resource
        const resourcesWithRatings = await Promise.all(
          data.resources.map(async (resource: SearchResource) => {
            try {
              const ratingResponse = await fetch(`/api/ratings/${resource.id}`);
              const ratingData = await ratingResponse.json();
              return {
                ...resource,
                averageRating: ratingData.average || 0,
                ratingCount: ratingData.count || 0,
              };
            } catch (error) {
              console.error(
                `Failed to fetch rating for ${resource.id}:`,
                error
              );
              return {
                ...resource,
                averageRating: 0,
                ratingCount: 0,
              };
            }
          })
        );
        setResults(resourcesWithRatings);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (resourceId: string) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    // Call the callback if provided (to close modal on mobile)
    if (onResultClick) {
      onResultClick();
    }
    // Navigate to courses page with selected resource
    router.push(`/dashboard/courses?courseId=${resourceId}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 pr-10 py-2 rounded-lg border border-gray-200 w-full text-sm font-hanken focus:outline-none focus:ring-2 ${focusRingColor} text-[#8D8F91] ${inputClassName}`}
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[500px] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700 font-hanken">
              Found {results.length} resource{results.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Results */}
          <div className="p-2">
            {results.map((resource) => (
              <button
                key={resource.id}
                onClick={() => handleResultClick(resource.id)}
                className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-purple-100">
                <div className="flex items-start space-x-3">
                  {/* Cover Photo or Color with Course Code */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-xl shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center"
                      style={{
                        backgroundColor: resource.coverColor || "#E5E7EB",
                        backgroundImage: resource.coverPhoto
                          ? `url(${resource.coverPhoto})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}>
                      {/* Show course code only if no cover photo */}
                      {!resource.coverPhoto && (
                        <span className="text-xs font-bold text-white select-none">
                          {(resource.title || "TITLE")
                            .slice(0, 6)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Resource Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 font-hanken truncate group-hover:text-purple-600 transition-colors">
                      {resource.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-hanken line-clamp-2 mt-1 leading-relaxed">
                      {resource.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
                      {/* Department Badge */}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium font-hanken">
                        {resource.department}
                      </span>

                      {/* Level Badge */}
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-white text-[10px] font-medium font-hanken"
                        style={{
                          backgroundColor:
                            resource.level === "Beginner"
                              ? "#9FB9EB"
                              : resource.level === "Intermediate"
                              ? "#F588D6"
                              : "#F2BC33",
                        }}>
                        {resource.level}
                      </span>

                      {/* Downloads */}
                      <span className="inline-flex items-center text-[10px] text-gray-500 font-hanken">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        {resource.downloadCount}
                      </span>

                      {/* Views */}
                      <span className="inline-flex items-center text-[10px] text-gray-500 font-hanken">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {resource.viewCount}
                      </span>

                      {/* Rating */}
                      <span className="inline-flex items-center text-[10px] text-gray-500 font-hanken">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="#F6C244"
                          viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {resource.averageRating
                          ? resource.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && query && results.length === 0 && !isSearching && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-sm font-semibold text-gray-700 font-hanken mb-1">
              No resources found
            </p>
            <p className="text-xs text-gray-500 font-hanken">
              Try searching with different keywords
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-10 h-10 border-3 border-purple-200 rounded-full"></div>
              <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-sm font-medium text-gray-700 font-hanken">
              Searching resources...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
