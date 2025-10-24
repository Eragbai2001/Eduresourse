"use client"

import { BookOpen, CheckCircle, MessageSquare, Star, User } from "lucide-react"

export interface Activity {
  id: string
  type: "course" | "enrollment" | "feedback" | "completed" | "profile"
  title: string
  description: string
  date: string
  time: string
}

interface RecentActivitiesProps {
  activities?: Activity[]
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const defaultActivities: Activity[] = [
    {
      id: "1",
      type: "course",
      title: "New Course Added",
      description: '"Advanced Graphic Design Techniques" was published.',
      date: "March 2, 2025",
      time: "4:30 PM",
    },
    {
      id: "2",
      type: "enrollment",
      title: "Completed Enrollment",
      description: "Aurelia Chandler successfully enrolled in 'Social Media Marketing Strategies'.",
      date: "March 2, 2025",
      time: "2:15 PM",
    },
    {
      id: "3",
      type: "feedback",
      title: "User Feedback Submitted",
      description: "Benita Tray rated 'JavaScript Essentials' 5 stars and left a review.",
      date: "March 1, 2025",
      time: "11:45 AM",
    },
    {
      id: "4",
      type: "completed",
      title: "Course Completed",
      description: "Clara Bautista completed 'Business Analytics with Excel' and received a certificate.",
      date: "March 1, 2025",
      time: "9:30 AM",
    },
  ]

  const displayActivities = activities || defaultActivities

  const getIcon = (type: Activity["type"]) => {
    const iconProps = "w-4 h-4"
    switch (type) {
      case "course":
        return <BookOpen className={`${iconProps} text-blue-500`} />
      case "enrollment":
        return <User className={`${iconProps} text-pink-500`} />
      case "feedback":
        return <Star className={`${iconProps} text-yellow-500`} />
      case "completed":
        return <CheckCircle className={`${iconProps} text-green-500`} />
      case "profile":
        return <MessageSquare className={`${iconProps} text-purple-500`} />
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 lg:p-5 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Recent Activities</h3>
        <button className="text-xs text-gray-500 hover:text-gray-700">This Week</button>
      </div>
      <div className="space-y-3 max-h-80  pr-1">
        {displayActivities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`flex gap-3 pb-3 ${index !== displayActivities.length - 1 ? 'border-b border-gray-100' : ''}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-tight">{activity.title}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1.5">
                {activity.date} at {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}