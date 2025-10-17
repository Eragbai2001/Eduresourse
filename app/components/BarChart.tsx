"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChartData = { title: string; rating: number }[];

interface BarChartProps {
  data: BarChartData;
}

export default function BarChart({ data }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Truncate labels and prepare data
    const labels = data.map((d) =>
      d.title.length > 15 ? d.title.slice(0, 15) + "..." : d.title
    );
    const ratings = data.map((d) => d.rating);

    console.log("[BarChart] Rendering with data:", { labels, ratings });

    // Use a color palette or fallback
    const palette = [
      "#FFB0E8",
      "#E8F0FF",
      "#CDDEFF",
      "#FFD365",
      "#A7F3D0",
      "#FDE68A",
      "#FCA5A5",
      "#C7D2FE",
    ];
    const backgroundColor = data.map((_, i) => palette[i % palette.length]);

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Rating",
            data: ratings,
            backgroundColor,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 50,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 1,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Rating: ${context.parsed.y}/5`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
            ticks: {
              color: "#9CA3AF",
              font: { size: 11 },
              stepSize: 1,
            },
            grid: { color: "#F3F4F6" },
          },
          x: {
            ticks: {
              color: "#6B7280",
              font: { size: 10, family: "Hanken Grotesk" },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: { display: false },
          },
        },
      },
    });

    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-hanken font-semibold text-gray-900">
          Course Rating
        </h3>
        <select className="text-sm text-gray-600 border-none focus:outline-none cursor-pointer">
          <option>This Week</option>
        </select>
      </div>
      <div className="flex-1 min-h-[220px] w-full relative">
        <div className="absolute inset-0">
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
}
