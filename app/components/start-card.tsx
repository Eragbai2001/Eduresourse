import type React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  backgroundColor: string;
  textColor?: string;
  iconBgColor?: string;
}

export function StatCard({
  icon,
  label,
  value,
  backgroundColor,
  textColor = "#000000",
  iconBgColor = "#ffffff",
}: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col md:flex-row items-center md:justify-between transition-shadow"
      style={{ backgroundColor }}>
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        <div
          className="p-6 md:p-4 rounded-2xl flex items-center justify-center flex-shrink-0 min-w-[80px] md:min-w-[64px]"
          style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
        <div className="text-center md:text-left flex-1 md:flex-initial">
          <p
            className="text-sm font-medium opacity-75 mb-2 md:mb-0"
            style={{ color: textColor }}>
            {label}
          </p>
          <p
            className="text-2xl md:text-2xl font-bold"
            style={{ color: textColor }}>
            {value}
          </p>
        </div>
      </div>
      <button
        className="p-2 rounded-lg hidden lg:block"
        style={{ backgroundColor: iconBgColor }}
        aria-label="More options">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke={textColor}
          strokeWidth="2">
          <circle cx="3" cy="10" r="1" />
          <circle cx="10" cy="10" r="1" />
          <circle cx="17" cy="10" r="1" />
        </svg>
      </button>
    </div>
  );
}
