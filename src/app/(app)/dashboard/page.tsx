import { headers } from "next/headers";
import { DollarSign, Package, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewChart } from "@/components/admin/overview-chart";
import { RecentSales } from "@/components/admin/recent-sales";
import { analytics, stores } from "@/lib/placeholder-data";
import StatCard from "@/components/admin/stat-card";
import { notFound } from "next/navigation";
import { ClientDashboard } from "./_components/client-dashboard";

export default function DashboardPage() {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const store = stores.find(s => s.id === storeId);

  if (!store) {
    // In a real app, you might want a better UX for a store admin
    // trying to access a dashboard without a valid store context.
    notFound();
  }

  // NOTE: The analytics data is currently global for all stores.
  // In a real application, you would filter this data based on the `storeId`.
  
  return (
    <ClientDashboard
      store={store}
      analytics={analytics}
    />
  );
}
