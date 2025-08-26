"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  options: string[];
  defaultOption?: string;
  onChange?: (selectedOption: string) => void;
  className?: string;
}

export default function CustomDropdown({
  options,
  defaultOption = options[0],
  onChange,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div 
        className="flex items-center justify-between bg-white rounded-lg py-2 px-4 text-sm w-40 cursor-pointer "
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[#2E3135] font-[12px]">{selectedOption}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg  z-10 py-1 text-[#2E3135]">
          {options.map((option) => (
            <div
              key={option}
              className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                selectedOption === option ? 'bg-gray-50' : ''
              }`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}