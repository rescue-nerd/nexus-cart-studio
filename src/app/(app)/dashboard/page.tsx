import { DollarSign, Package, ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OverviewChart } from "@/components/admin/overview-chart";
import { RecentSales } from "@/components/admin/recent-sales";
import { analytics } from "@/lib/placeholder-data";
import StatCard from "@/components/admin/stat-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
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
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
