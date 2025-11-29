import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://uqorqernrucnemhedswu.supabase.co`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    },
  });

  const { users } = await res.json();

  // Aggregate by month
  const monthlyCounts: Record<string, number> = {};
  users.forEach((user: { created_at: string }) => {
    const month = new Date(user.created_at).toISOString().slice(0, 7); // "YYYY-MM"
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
  });

  // Sort and format for chart
  const months = Object.keys(monthlyCounts).sort();
  const rows = months.map((month) => ({
    month,
    count: monthlyCounts[month],
  }));

  // Add percentage change
  const withChange = rows.map((item, idx, arr) => {
    if (idx === 0) return { ...item, change: "+0.0%" };
    const prev = arr[idx - 1].count;
    const diff = item.count - prev;
    const pct = prev ? ((diff / prev) * 100).toFixed(1) : "0.0";
    return {
      ...item,
      change: `${diff >= 0 ? "+" : ""}${pct}%`,
    };
  });

  return NextResponse.json({ data: withChange });
}