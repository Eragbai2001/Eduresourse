import type React from "react"
import { StatCard } from "./start-card"
import Image from "next/image"

// Icons as SVG components
const StudentIcon = () => (
  <Image src="/vector.png" alt="Student icon" width={30} height={30} className="block" />
)

const CourseIcon = () => (
  <Image src="/vector2.png" alt="Course icon" width={30} height={30} className="block" />
)

const EnrollmentIcon = () => (
  <Image src="/vector3.png" alt="Enrollment icon" width={30} height={30} className="block" />
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
