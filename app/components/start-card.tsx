import type React from "react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  backgroundColor: string
  textColor?: string
  iconBgColor?: string
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
      className="rounded-lg p-6 flex items-center justify-between  transition-shadow"
      style={{ backgroundColor }}
    >
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBgColor }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium opacity-75" style={{ color: textColor }}>
            {label}
          </p>
          <p className="text-2xl font-medium" style={{ color: textColor }}>
            {value}
          </p>
        </div>
      </div>
    <button
      className="p-2 rounded-lg  bg-white"
      style={{ backgroundColor: iconBgColor }}
      aria-label="More options"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={textColor} strokeWidth="2">
        <circle cx="3" cy="10" r="1" />
        <circle cx="10" cy="10" r="1" />
        <circle cx="17" cy="10" r="1" />
      </svg>
    </button>
    </div>
  )
}
