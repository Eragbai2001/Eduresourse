import Sidebar from "@/app/components/Sidebar";

export default function StudentsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 font-hanken">Students</h1>
        <p className="font-hanken">Manage and review student information.</p>
      </main>
    </div>
  );
}
