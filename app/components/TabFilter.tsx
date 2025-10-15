"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import CustomDropdown from "./CustomDropdown";

interface TabFilterProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  departments: string[];
  levels: string[];
  activeDepartment: string;
  activeLevel: string;
  onDepartmentChange: (department: string) => void;
  onLevelChange: (level: string) => void;
  onSearchClick?: () => void;
  showSearch?: boolean;
}

export default function TabFilter({
  tabs,
  activeTab,
  onTabChange,
  departments,
  levels,
  activeDepartment,
  activeLevel,
  onDepartmentChange,
  onLevelChange,
  onSearchClick,
  showSearch = true,
}: TabFilterProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedOutsideMobile =
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node);

      const clickedOutsideDesktop =
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node);

      if (clickedOutsideMobile && clickedOutsideDesktop) {
        setMobileFiltersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Tab filters */}
      <div className="bg-white rounded-xl flex h-10 overflow-x-auto gap-1 ">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-2 md:px-3 lg:px-4 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap font-hanken ${
              activeTab === tab
                ? "bg-[#CDDEFF] text-[#2E3135]"
                : "text-[#797B7E] hover:bg-gray-50"
            }`}
            onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop: Category dropdown, Mobile: Search and Menu icons */}
      <div className="flex items-center space-x-2">
        {/* Search icon for mobile */}
        {showSearch && (
          <div className="block md:hidden">
            <button
              onClick={onSearchClick}
              className="bg-white w-10 h-10 flex items-center justify-center rounded-lg"
              aria-label="Search courses">
              <Search size={20} stroke="#2E3135" strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Menu icon for mobile */}
        <div className="block md:hidden">
          <div className="relative" ref={mobileDropdownRef}>
            <button
              className="bg-[#CDDEFF] w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <Image
                src="/courses/filter.png"
                alt="Filter"
                width={24}
                height={24}
              />
            </button>

            {mobileFiltersOpen && (
              <div
                className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64 space-y-3"
                onClick={(e) => e.stopPropagation()}>
                <CustomDropdown
                  options={departments}
                  defaultOption={activeDepartment}
                  onChange={onDepartmentChange}
                />
                <CustomDropdown
                  options={levels}
                  defaultOption={activeLevel}
                  onChange={onLevelChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dropdown for desktop */}
        <div className="hidden md:block">
          <div className="relative" ref={desktopDropdownRef}>
            <button
              className="bg-[#CDDEFF] w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <Image
                src="/courses/filter.png"
                alt="Filter"
                width={24}
                height={24}
              />
            </button>

            {mobileFiltersOpen && (
              <div
                className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4 w-64 space-y-3"
                onClick={(e) => e.stopPropagation()}>
                <CustomDropdown
                  options={departments}
                  defaultOption={activeDepartment}
                  onChange={onDepartmentChange}
                />
                <CustomDropdown
                  options={levels}
                  defaultOption={activeLevel}
                  onChange={onLevelChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
