"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
  Tooltip,
  Layer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";

const enrollmentData = [
  { month: "Jan", enrollments: 450, change: "+1.1%" },
  { month: "Feb", enrollments: 520, change: "+0.6%" },
  { month: "Mar", enrollments: 680, change: "+1.3%" },
  { month: "Apr", enrollments: 850, change: "+7.3%" },
  { month: "May", enrollments: 620, change: "+2.2%" },
  { month: "Jun", enrollments: 680, change: "+0.6%" },
  { month: "Jul", enrollments: 720, change: "+1.8%" },
];

export function EnrollmentTrendsChart() {
  const getBarColor = (month: string) =>
    month === "Apr" ? "#FFD365" : "#FFB0E8";

  const getBadgeColor = (month: string) =>
    month === "Apr" ? "#CDDEFF" : "#FFD6F3";

  // ✅ Custom label above bars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomLabel = (props: any) => {
    const { x, y, width, value, payload } = props;
    if (!payload) return null;

    const badgeWidth = 38;
    const badgeHeight = 18;
    const badgeColor = getBadgeColor(payload.month);

    // make sure it’s well above the bar
    const badgeX = x + width / 2 - badgeWidth / 2;
    const badgeY = y - badgeHeight - 8;

    return (
      <Layer>
        <rect
          x={badgeX}
          y={badgeY}
          width={badgeWidth}
          height={badgeHeight}
          rx={8}
          ry={8}
          fill={badgeColor}
        />
        <text
          x={x + width / 2}
          y={badgeY + 12}
          textAnchor="middle"
          fontSize={10}
          fill="#444"
          fontWeight="600">
          {value}
        </text>
      </Layer>
    );
  };

  // ✅ Rounded bar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRoundedBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    if (height <= 0) return <g />;

    const radius = 10; // control roundness (4–12)
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={radius}
        ry={radius}
        fill={fill}
      />
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
        <div className="h-[320px] sm:h-[300px] bg-white rounded-b-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enrollmentData}
              margin={{ top: 60, right: 20, left: 0, bottom: 10 }} // extra top space
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#CFCFCF"
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
                shape={renderRoundedBar}
                maxBarSize={50}
                isAnimationActive={false}>
                {/* 👇 This forces the labels to appear above all other layers */}
                <LabelList
                  dataKey="change"
                  content={<CustomLabel />}
                  position="top"
                />
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
