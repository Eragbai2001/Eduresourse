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

export default function BarChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstanceRef.current = new ChartJS(ctx, {
      type: "bar",
      data: {
        labels: ["Design", "Marketing", "Web Dev", "Business"],
        datasets: [
          {
            label: "Rating",
            data: [4.7, 4.8, 4.6, 4.8],
            backgroundColor: ["#FFB0E8", "#E8F0FF", "#CDDEFF", "#FFD365"],
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
          legend: {
            display: false,
          },
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
              font: {
                size: 11,
              },
              stepSize: 1,
            },
            grid: {
              color: "#F3F4F6",
            },
          },
          x: {
            ticks: {
              color: "#6B7280",
              font: {
                size: 12,
                family: "Hanken Grotesk",
              },
            },
            grid: {
              display: false,
            },
          },
        },
      },
    });

    // Add resize observer to handle window resize
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
  }, []);

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
