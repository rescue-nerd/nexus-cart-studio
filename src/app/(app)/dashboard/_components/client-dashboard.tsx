
"use client";

import { DollarSign, Package, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/admin/overview-chart";
import { RecentSales } from "@/components/admin/recent-sales";
import StatCard from "@/components/admin/stat-card";
import { useTranslation } from "@/hooks/use-translation";
import type { Store } from "@/lib/types";

type Analytics = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  salesData: { name: string; total: number }[];
};

interface ClientDashboardProps {
  store: Store;
  analytics: Analytics;
}

export function ClientDashboard({ store, analytics }: ClientDashboardProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {t("dashboard.title", { storeName: store.name })}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.description")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("dashboard.totalSales")}
          value={`Rs ${analytics.totalSales.toLocaleString()}`}
          icon={DollarSign}
          description={t("dashboard.totalSalesDesc")}
        />
        <StatCard
          title={t("dashboard.totalOrders")}
          value={`+${analytics.totalOrders.toLocaleString()}`}
          icon={ShoppingCart}
          description={t("dashboard.totalOrdersDesc")}
        />
        <StatCard
          title={t("dashboard.totalProducts")}
          value={analytics.totalProducts.toLocaleString()}
          icon={Package}
          description={t("dashboard.totalProductsDesc")}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboard.overview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={analytics.salesData} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.recentSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales storeId={store.id} noSalesMessage={t('dashboard.noRecentSales')} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
