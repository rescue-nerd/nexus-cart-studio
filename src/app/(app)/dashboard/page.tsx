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
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dashboard for {store.name}</h1>
        <p className="text-muted-foreground">
          Here's an overview of your store's performance.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Sales"
          value={`Rs ${analytics.totalSales.toLocaleString()}`}
          icon={DollarSign}
          description="Total revenue from all sales"
        />
        <StatCard 
          title="Total Orders"
          value={`+${analytics.totalOrders.toLocaleString()}`}
          icon={ShoppingCart}
          description="Total number of orders placed"
        />
        <StatCard 
          title="Total Products"
          value={analytics.totalProducts.toLocaleString()}
          icon={Package}
          description="Total number of active products"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={analytics.salesData} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales storeId={store.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
