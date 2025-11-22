"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const enrollmentData = [
  { month: "Jan", enrollments: 450, change: "+1.1%" },
  { month: "Feb", enrollments: 520, change: "+0.6%" },
  { month: "Mar", enrollments: 680, change: "+1.3%" },
  { month: "Apr", enrollments: 850, change: "+7.3%" },
  { month: "May", enrollments: 620, change: "-1.3%" },
  { month: "Jun", enrollments: 680, change: "-2.2%" },
  { month: "Jul", enrollments: 720, change: "+0.8%" },
];

export function EnrollmentTrendsChart() {
  const getBarColor = (month: string) =>
    month === "Apr" ? "#FFD365" : "#FFB0E8";

  // ✅ Rounded bar with label on top
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRoundedBarWithLabel = (props: any) => {
    const { x, y, width, height, fill, payload } = props;
    if (height <= 0) return <g />;

    const radius = 10;
    
    // Check if decrease (starts with minus)
    const isDecrease = payload.change.includes("-");
    
    // Badge settings
    const badgeWidth = 52;
    const badgeHeight = 22;
    const badgeColor = isDecrease ? "#FFD6F3" : "#CDDEFF";

    const badgeX = x + width / 2 - badgeWidth / 2;
    const badgeY = y - badgeHeight - 8;
    
    // Icon to use based on increase/decrease
    const Icon = isDecrease ? ArrowDownLeft : ArrowUpRight;

    return (
      <g>
        {/* The bar itself */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={radius}
          ry={radius}
          fill={fill}
        />
        
        {/* Badge background */}
        <rect
          x={badgeX}
          y={badgeY}
          width={badgeWidth}
          height={badgeHeight}
          rx={11}
          ry={11}
          fill={badgeColor}
        />
        
        {/* Lucide icon using foreignObject */}
        <foreignObject
          x={badgeX + 5}
          y={badgeY + 5}
          width={12}
          height={12}
        >
          <Icon size={12} color="#2E3135" strokeWidth={1.5} />
        </foreignObject>
        
        {/* Percentage text - remove + or - sign, add spacing */}
        <text
          x={badgeX + 21}
          y={badgeY + badgeHeight / 2 + 4}
          textAnchor="start"
          fontSize={11}
          fill="#2E3135"
          fontWeight="500">
          {payload.change.replace(/[+-]/g, '')}
        </text>
      </g>
    );
  };

  return (
    <Card className="bg-white border-none shadow-none rounded-2xl h-fit max-h-[340px] min-h-[220px]">
      <CardHeader className="flex flex-row items-center justify-between  pt-4 px-6">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Enrollment Trends
        </CardTitle>
        <button className="text-xs text-gray-500 hover:text-gray-700">
          Last 7 Months ▼
        </button>
      </CardHeader>

      <CardContent className=" pb-6 ">
        <div className="h-[320px] sm:h-[300px] bg-white rounded-b-2xl" style={{ overflow: 'visible' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enrollmentData}
              margin={{ top: 40, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#CFCFCF"
                strokeWidth={0.5}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#888" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#AAA" }}
                domain={[0, 1000]}
                ticks={[0, 250, 500, 750, 1000]}
              />
              <Tooltip cursor={false} />
              <Bar
                dataKey="enrollments"
                shape={renderRoundedBarWithLabel}
                maxBarSize={50}
                isAnimationActive={false}>
                {enrollmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.month)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}