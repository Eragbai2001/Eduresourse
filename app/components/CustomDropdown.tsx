"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties | null>(
    null
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const clickedInsideTrigger =
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node);
      const clickedInsideMenu =
        menuContainerRef.current &&
        menuContainerRef.current.contains(event.target as Node);

      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Position the menu in a portal to avoid being clipped by overflow parents
  useEffect(() => {
    if (!isOpen) {
      setMenuStyles(null);
      return;
    }

    const trigger = dropdownRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const styles: React.CSSProperties = {
      position: "absolute",
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      zIndex: 9999,
    };

    setMenuStyles(styles);
  }, [isOpen]);

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
        onClick={() => setIsOpen(!isOpen)}>
        <span className="text-[#2E3135] font-[12px]">{selectedOption}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && typeof document !== "undefined" && menuStyles
        ? createPortal(
            <div
              ref={(el) => (menuContainerRef.current = el)}
              style={menuStyles}
              className="bg-white rounded-lg shadow-lg py-1 text-[#2E3135]"
              onClick={(e) => e.stopPropagation()}>
              {options.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer ${
                    selectedOption === option ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}>
                  {option}
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
