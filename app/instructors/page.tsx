import Sidebar from "@/app/components/Sidebar";

export default function InstructorsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 font-hanken">Instructors</h1>
        <p className="font-hanken">View and connect with instructors.</p>
      </main>
    </div>
  );
}
