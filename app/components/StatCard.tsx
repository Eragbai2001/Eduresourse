import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  isPositive,
}: StatCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 font-hanken">{title}</h3>
      <p className="text-2xl font-semibold mt-1 mb-2 font-hanken">{value}</p>
      <div
        className={`flex items-center text-xs ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}>
        {isPositive ? (
          <ArrowUp className="h-3 w-3 mr-1" />
        ) : (
          <ArrowDown className="h-3 w-3 mr-1" />
        )}
        <span className="font-hanken">{change} from last month</span>
      </div>
    </div>
  );
}
