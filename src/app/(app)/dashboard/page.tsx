import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default function DashboardPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    notFound();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Store Analytics Dashboard</h1>
      <AnalyticsDashboard storeId={storeId} />
    </main>
  );
}
