"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"

const revenueData = [
  { month: "Jan", income: 6500, expense: 4200 },
  { month: "Feb", income: 7200, expense: 4800 },
  { month: "Mar", income: 8100, expense: 5200 },
  { month: "Apr", income: 10548, expense: 6500 },
  { month: "May", income: 8900, expense: 5800 },
  { month: "Jun", income: 7800, expense: 5100 },
  { month: "Jul", income: 8500, expense: 5400 },
]

export function RevenueChart() {
  return (
    <Card className="bg-white  shadow-none border-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Income vs Expense</CardDescription>
        </div>
        <button className="text-sm text-gray-600 hover:text-gray-900">Last 7 Months ▼</button>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" />
            <YAxis stroke="#999" label={{ value: "Amount", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#FFB0E8"
              strokeWidth={2}
              dot={{ fill: "#FFB0E8", r: 4 }}
              activeDot={{ r: 6 }}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#000"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#000", r: 4 }}
              activeDot={{ r: 6 }}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
