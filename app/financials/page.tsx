import Sidebar from "@/app/components/Sidebar";

export default function FinancialsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 font-hanken">Financials</h1>
        <p className="font-hanken">
          Track your financial information and transactions.
        </p>
      </main>
    </div>
  );
}
