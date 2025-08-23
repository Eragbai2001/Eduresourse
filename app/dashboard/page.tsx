import StatCard from "@/app/components/StatCard";

export default function DashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value="1,284"
          change="+12.5%"
          isPositive={true}
        />
        <StatCard
          title="Course Enrollments"
          value="3,567"
          change="+8.2%"
          isPositive={true}
        />
        <StatCard
          title="Average Completion"
          value="76.2%"
          change="-2.4%"
          isPositive={false}
        />
        <StatCard
          title="Revenue"
          value="$35,268"
          change="+18.6%"
          isPositive={true}
        />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4 font-hanken">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {/* Activity items would go here */}
          <p className="font-hanken text-gray-600">
            No recent activity to display.
          </p>
        </div>
      </div>
    </div>
  );
}
