import React from "react";
import HeatMap from "react-heatmap-grid";

// ---- Add this if you don't have @types/react-heatmap-grid ----
// Create a file `react-heatmap-grid.d.ts` in your /types folder (see below)

type Props = {
  data: number[][]; // rows: hours (e.g., 9am→3pm), cols: days (Sun→Sat)
  xLabels: string[]; // e.g. ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  yLabels: string[]; // e.g. ["9am","10am","11am","12pm","1pm","2pm","3pm"]
};

const getCellStyle = (value: number) => {
  if (value >= 151) return "bg-yellow-400";
  if (value >= 101) return "bg-pink-400";
  if (value >= 51) return "bg-pink-200";
  if (value > 0) return "bg-pink-100";
  return "bg-gray-50";
};

const LearningActivityHeatmap: React.FC<Props> = ({
  data,
  xLabels,
  yLabels,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4 w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Learning Activity
      </h2>

      <div className="overflow-auto">
        <HeatMap
          xLabels={xLabels}
          yLabels={yLabels}
          data={data}
          cellHeight={28}
          xLabelsLocation="bottom"
          cellStyle={() => ({
            padding: 0,
          })}
          cellRender={(value: number) => (
            <div
              className={`h-full w-full flex items-center justify-center ${getCellStyle(
                value
              )}`}
            />
          )}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-end gap-4 mt-4 text-xs text-gray-500">
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
};

export default LearningActivityHeatmap;
