"use client";
import React from "react";

type ActivityHeatmapProps = {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
};

const getColor = (value: number) => {
  if (value >= 151) return "bg-yellow-400";
  if (value >= 101) return "bg-pink-400";
  if (value >= 51) return "bg-pink-200";
  if (value > 0) return "bg-pink-100";
  return "bg-gray-50";
};

export default function ActivityHeatmap({
  data,
  xLabels,
  yLabels,
}: ActivityHeatmapProps) {
  return (
    <div className="bg-white shadow-none rounded-2xl p-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Learning Activity
      </h2>

      <div
        className={`grid grid-cols-${
          xLabels.length + 1
        } gap-1 text-center text-xs text-gray-500`}>
        <div></div>
        {xLabels.map((d) => (
          <div key={d}>{d}</div>
        ))}

        {data.map((row, rowIdx) => (
          <React.Fragment key={yLabels[rowIdx] || rowIdx}>
            <div className="text-gray-500 text-xs flex items-center justify-center">
              {yLabels[rowIdx] || rowIdx}
            </div>
            {row.map((val, i) => (
              <div
                key={i}
                className={`h-6 w-6 rounded-md ${getColor(val)} transition-all`}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-2 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-pink-100" /> 1–50
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-pink-200" /> 51–100
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-pink-400" /> 101–150
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-yellow-400" /> 151–200
        </div>
      </div>
    </div>
  );
}
