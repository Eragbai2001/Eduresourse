"use client";
import React from "react";

type ActivityHeatmapProps = {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
};

const COLORS = {
  empty: "#FAFAFA",
  low: "#FFEEFA", // 1-50
  mid: "#FFD6F3", // 51-100
  mid2: "#FD98E0", // 101-150 (new)
  high: "#F9C952", // 151+
};

const getColor = (value: number) => {
  if (!value || value === 0) return COLORS.empty;
  if (value > 0 && value <= 50) return COLORS.low;
  if (value > 50 && value <= 100) return COLORS.mid;
  if (value > 100 && value <= 150) return COLORS.mid2;
  return COLORS.high; // 151+
};

export default function ActivityHeatmap({
  data,
  xLabels,
  yLabels,
}: ActivityHeatmapProps) {
  return (
    <div className="bg-white shadow-none p-4 w-full max-w-md rounded-2xl max-h-[340px] min-h-[220px] flex flex-col items-align">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Learning Activity
      </h2>

      {/* Legend above grid, centered */}
      <div className="flex justify-start gap-4 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded"
            style={{ backgroundColor: COLORS.low }}
          />{" "}
          1–50
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded"
            style={{ backgroundColor: COLORS.mid }}
          />{" "}
          51–100
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded"
            style={{ backgroundColor: COLORS.mid2 }}
          />{" "}
          101–150
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded"
            style={{ backgroundColor: COLORS.high }}
          />{" "}
          151–200
        </div>
      </div>

      {/* Heatmap grid: first column for yLabels, then xLabels.length columns for values */}
      <div
        className="grid gap-1 text-center text-xs text-gray-500"
        style={{
          // first column auto for yLabels, then fixed small columns for days so cells and labels align
          gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(0, 1fr))`,
        }}>
        {/* Heat rows */}
        {data.map((row, rowIdx) => (
          <React.Fragment key={yLabels[rowIdx] || rowIdx}>
            <div className="text-gray-500 text-xs flex items-center justify-center">
              {yLabels[rowIdx] || rowIdx}
            </div>
            {row.map((val, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-md transition-all"
                style={{ backgroundColor: getColor(val) }}
              />
            ))}
          </React.Fragment>
        ))}

        {/* Final row for weekday labels — perfectly aligned */}
        <div></div>
        {xLabels.map((d) => (
          <div
            key={d}
            className="text-gray-500 text-xs flex items-center justify-start pt-1">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}
