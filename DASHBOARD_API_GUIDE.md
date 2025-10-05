# Dashboard Statistics API Guide

## Overview
This API endpoint provides comprehensive statistics for the dashboard, including student counts, course metrics, enrollment trends, and learning activity data.

## Endpoint
```
GET /api/dashboard/stats
```

## Authentication
Ensure the user is authenticated before calling this endpoint (use your existing auth middleware).

---

## Response Structure

### Overview Stats
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 1278,
      "totalCourses": 138,
      "totalEnrollments": 948,
      "totalViews": 5432
    }
  }
}
```

### Enrollment Trends (Last 7 Months)
```json
{
  "enrollmentTrends": {
    "Jan": 450,
    "Feb": 520,
    "Mar": 680,
    "Apr": 750,
    "May": 720,
    "Jun": 800,
    "Jul": 850
  }
}
```

### Top Courses
```json
{
  "topCourses": [
    {
      "id": "uuid",
      "title": "UI/UX Design for Beginners",
      "department": "Design",
      "level": "100",
      "viewCount": 1200,
      "downloadCount": 350,
      "coverPhoto": "/courses/design.png",
      "coverColor": "#FFB0E8",
      "resourceCount": 25,
      "rank": 1,
      "percentage": 35
    }
  ]
}
```

### Recent Resources (Past Questions)
```json
{
  "recentResources": [
    {
      "id": "uuid",
      "title": "Advanced Graphic Design Techniques",
      "department": "Design",
      "level": "300",
      "description": "Comprehensive design course...",
      "coverPhoto": "/courses/design.png",
      "coverColor": "#FFB0E8",
      "resourceCount": 22,
      "downloadCount": 420,
      "viewCount": 1050,
      "createdAt": "2025-03-07T16:40:00.000Z",
      "timeAgo": "2 days ago"
    }
  ]
}
```

### Recent Feedback (Ratings)
```json
{
  "recentFeedback": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "resourceId": "resource-uuid",
      "score": 5,
      "review": "Excellent resource! Very helpful",
      "createdAt": "2025-03-07T14:30:00.000Z",
      "userName": "Benita Tray",
      "resourceTitle": "JavaScript Essentials"
    }
  ]
}
```

### Learning Activity (Last 7 Days)
```json
{
  "learningActivity": [
    {
      "day": "Mon",
      "hour": 9,
      "count": 45
    },
    {
      "day": "Mon",
      "hour": 10,
      "count": 78
    }
  ]
}
```

---

## Usage Examples

### 1. React/Next.js Client Component

```typescript
"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalViews: number;
  };
  enrollmentTrends: Record<string, number>;
  topCourses: Array<{
    id: string;
    title: string;
    department: string;
    level: string;
    viewCount: number;
    downloadCount: number;
    rank: number;
    percentage: number;
  }>;
  recentResources: Array<any>;
  recentFeedback: Array<any>;
  learningActivity: Array<{ day: string; hour: number; count: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard/stats");
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

        const result = await response.json();
        
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return null;

  return (
    <div className="dashboard">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={stats.overview.totalStudents}
          icon="👨‍🎓"
          color="pink"
        />
        <StatCard
          title="Total Courses"
          value={stats.overview.totalCourses}
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Total Enrollments"
          value={stats.overview.totalEnrollments}
          icon="✓"
          color="yellow"
        />
      </div>

      {/* Top Courses */}
      <div className="top-courses">
        <h2>Top Courses</h2>
        {stats.topCourses.map((course) => (
          <div key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.department} - {course.percentage}%</p>
            <p>{course.viewCount} students</p>
          </div>
        ))}
      </div>

      {/* Recent Resources */}
      <div className="recent-resources">
        <h2>New Past Questions</h2>
        {stats.recentResources.map((resource) => (
          <div key={resource.id}>
            <h3>{resource.title}</h3>
            <p>{resource.timeAgo}</p>
          </div>
        ))}
      </div>

      {/* Enrollment Trends Chart */}
      <div className="enrollment-trends">
        <h2>Enrollment Trends</h2>
        {/* Use a chart library like recharts or chart.js */}
        {Object.entries(stats.enrollmentTrends).map(([month, count]) => (
          <div key={month}>
            {month}: {count}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Server Component (Recommended for Better Performance)

```typescript
// app/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

async function getDashboardStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/stats`, {
    cache: "no-store", // Always fetch fresh data
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }
  
  return response.json();
}

export default async function DashboardPage() {
  const result = await getDashboardStats();
  
  return <DashboardClient stats={result.data} />;
}
```

### 3. Using SWR (Recommended for Real-time Updates)

```typescript
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/dashboard/stats", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;

  const stats = data?.data;

  return (
    <div>
      <h1>Total Students: {stats.overview.totalStudents}</h1>
      {/* Rest of your dashboard */}
    </div>
  );
}
```

---

## Data Mapping for Your Dashboard Design

Based on the screenshots you provided, here's how to map the API data:

### Overview Cards (Top Section)
```typescript
// Total Students Card
<StatCard 
  title="Total Students" 
  value={stats.overview.totalStudents} 
  color="pink"
/>

// Total Courses Card
<StatCard 
  title="Total Courses" 
  value={stats.overview.totalCourses}
  color="blue"
/>

// Total Enrollments Card
<StatCard 
  title="Total Enrollments" 
  value={stats.overview.totalEnrollments}
  color="yellow"
/>
```

### Enrollment Trends Chart
```typescript
// Convert to array format for chart libraries
const enrollmentData = Object.entries(stats.enrollmentTrends).map(([month, count]) => ({
  month,
  enrollments: count
}));

// Use with Recharts
<BarChart data={enrollmentData}>
  <Bar dataKey="enrollments" fill="#FFB0E8" />
  <XAxis dataKey="month" />
</BarChart>
```

### Top Courses Donut Chart
```typescript
const topCoursesData = stats.topCourses.map(course => ({
  name: course.title,
  value: course.percentage,
  students: course.viewCount,
  lessons: course.resourceCount
}));

// Use with Recharts PieChart
<PieChart>
  <Pie data={topCoursesData} dataKey="value" />
</PieChart>
```

### Recent Activities (New Past Questions)
```typescript
stats.recentResources.slice(0, 3).map(resource => (
  <div key={resource.id} className="activity-item">
    <div className="icon">📄</div>
    <div>
      <p className="title">New Course Added</p>
      <p className="description">"{resource.title}" was published.</p>
      <p className="time">{resource.timeAgo}</p>
    </div>
  </div>
))
```

### Learning Activity Heatmap
```typescript
// Group by day and hour for heatmap
const activityMatrix = stats.learningActivity.reduce((matrix, item) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = days.indexOf(item.day);
  
  if (!matrix[dayIndex]) matrix[dayIndex] = [];
  matrix[dayIndex][item.hour] = item.count;
  
  return matrix;
}, [] as number[][]);

// Render heatmap cells with color intensity based on count
```

---

## Installation Requirements

Install necessary packages:

```bash
npm install swr
# or
npm install @tanstack/react-query

# For charts
npm install recharts
# or
npm install chart.js react-chartjs-2
```

---

## Performance Tips

1. **Use Server Components** when possible (Next.js App Router)
2. **Implement caching** with SWR or React Query
3. **Add loading states** for better UX
4. **Consider pagination** for large datasets
5. **Use WebSockets** for real-time updates (optional)

---

## Future Enhancements

To make your dashboard even better, consider adding:

1. **Date Range Filters** - Allow users to filter by date range
2. **Export to CSV** - Export dashboard data
3. **Revenue Tracking** - Add payment models to track revenue
4. **Student Progress** - Track individual student progress
5. **Course Completion Rates** - Calculate completion percentages
6. **Real-time Notifications** - WebSocket integration

---

## Need Help?

If you need to:
- Add more metrics
- Create custom filters
- Implement real-time updates
- Add revenue tracking

Just let me know! 🚀
