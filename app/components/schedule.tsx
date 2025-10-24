"use client"

export interface ScheduleEvent {
  id: string
  date: number
  title: string
  time: string
  color: "blue" | "pink" | "yellow"
}

interface ScheduleProps {
  events?: ScheduleEvent[]
}

export function Schedule({ events }: ScheduleProps) {
  const defaultEvents: ScheduleEvent[] = [
    {
      id: "1",
      date: 12,
      title: "UI/UX Design Principles",
      time: "8:00 PM - 10:00 PM UTC",
      color: "blue",
    },
    {
      id: "2",
      date: 21,
      title: "Industry Networking Night",
      time: "6:00 PM - 9:00 PM UTC",
      color: "pink",
    },
    {
      id: "3",
      date: 31,
      title: "Client Consultation",
      time: "4:00 PM - 5:30 PM UTC",
      color: "yellow",
    },
  ]

  const displayEvents = events || defaultEvents

  const colorClasses = {
    blue: "text-blue-600",
    pink: "text-pink-600",
    yellow: "text-yellow-600",
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-white rounded-lg p-4 lg:p-5">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm lg:text-base">Schedule</h3>
      <div className="space-y-4">
        {displayEvents.map((event) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0 min-w-[40px]">
              <div className={`text-lg font-bold ${colorClasses[event.color]}`}>{event.date}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {dayNames[new Date(2028, 2, event.date).getDay()]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 leading-tight">{event.title}</p>
              <p className="text-xs text-gray-500 mt-1">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}