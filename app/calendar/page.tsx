import Sidebar from "@/app/components/Sidebar";

export default function CalendarPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 font-hanken">Calendar</h1>
        <p className="font-hanken">Your schedule and events.</p>
      </main>
    </div>
  );
}
