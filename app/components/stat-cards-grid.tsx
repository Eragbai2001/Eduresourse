import type React from "react"
import { StatCard } from "./start-card"

// Icons as SVG components
const StudentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CourseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const EnrollmentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface StatCardsGridProps {
  stats?: Array<{
    icon: React.ReactNode
    label: string
    value: string | number
    backgroundColor: string
  }>
}

export function StatCardsGrid({ stats }: StatCardsGridProps) {
  const defaultStats = [
    {
      icon: <StudentIcon />,
      label: "Total Students",
      value: "1,278",
      backgroundColor: "#FFB0E8",
    },
    {
      icon: <CourseIcon />,
      label: "Total Courses",
      value: "138",
      backgroundColor: "#CDDEFF",
    },
    {
      icon: <EnrollmentIcon />,
      label: "Total Enrollments",
      value: "948",
      backgroundColor: "#FFD365",
    },
  ]

  const cardsToDisplay = stats || defaultStats

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {cardsToDisplay.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          backgroundColor={stat.backgroundColor}
          textColor="#000000"
          iconBgColor="#FFFFFF"
        />
      ))}
    </div>
  )
}
