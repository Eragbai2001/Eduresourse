declare module "react-heatmap-grid" {
  import * as React from "react";

  interface HeatMapProps {
    xLabels: string[];
    yLabels: string[];
    data: number[][];
    xLabelsLocation?: "top" | "bottom";
    cellHeight?: number;
    cellStyle?: (background: string, value: number, min: number, max: number, data: number[][], x: number, y: number) => React.CSSProperties;
    cellRender?: (value: number, x: number, y: number) => React.ReactNode;
  }

  const HeatMap: React.FC<HeatMapProps>;

  export default HeatMap;
}
