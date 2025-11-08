"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const courseData = [
  {
    name: "Graphic Design Fundamentals",
    value: 35,
    lessons: 15,
    students: 1200,
    color: "#CDDEFF",
  },
  {
    name: "Digital Marketing Mastery",
    value: 30,
    lessons: 12,
    students: 1050,
    color: "#FFB0E8",
  },
  {
    name: "Python for Beginners",
    value: 25,
    lessons: 10,
    students: 900,
    color: "#FFD365",
  },
];

type TooltipPayload = { payload: { name: string }; value: number };

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs">
        <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-gray-600">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {courseData.map((course, index) => (
        <div key={index} className="flex items-start gap-3">
          <div
            className="w-4 h-8 lg:h-10 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: course.color }}
          />
          <div className="flex flex-col leading-snug min-w-0 flex-1">
            <p className="font-medium text-gray-900 text-[13px] lg:text-[14px] mb-1">
              {course.name}
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] lg:text-[13px] text-gray-600">
              <span className="font-semibold whitespace-nowrap">
                {course.value}%
              </span>
              <span className="whitespace-nowrap">
                {course.lessons} Lessons
              </span>
              <span className="whitespace-nowrap">
                {course.students.toLocaleString()} Students
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export function TopCourses() {
  return (
    // Keep taller height until lg breakpoint, then match enrollment chart height
    <Card className="bg-white border-none shadow-none rounded-2xl h-fit max-h-[520px] lg:h-[340px] min-h-[220px]">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-6">
        <CardTitle className="text-[15px] font-semibold text-gray-800">
          Top Courses
        </CardTitle>
        <button className="text-xs text-gray-500 hover:text-gray-700">
          This Week ▼
        </button>
      </CardHeader>

      <CardContent className="pt-2 pb-6 px-3 sm:px-6 ">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6">
          {/* Donut chart */}
          <div className="w-full lg:w-[45%] flex justify-center flex-shrink-0">
            <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={3}
                    dataKey="value"
                    cornerRadius={10}>
                    {courseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full lg:flex-1">
            <CustomLegend />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
