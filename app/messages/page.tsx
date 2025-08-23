import Sidebar from "@/app/components/Sidebar";

export default function MessagesPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 font-hanken">Messages</h1>
        <p className="font-hanken">Your messages and communications.</p>
      </main>
    </div>
  );
}
