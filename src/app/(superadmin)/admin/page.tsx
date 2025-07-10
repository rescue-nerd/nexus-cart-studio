"use client";

import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default function AdminDashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </main>
  );
}
