"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/admin/stat-card";
import { OverviewChart } from "@/components/admin/overview-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import {
  fetchAnalyticsOverview,
  fetchTopProducts,
  fetchTopCategories,
  fetchRecentOrders,
  fetchRecentSignups,
} from "@/lib/analytics-fetchers";

interface AnalyticsDashboardProps {
  storeId?: string;
}

export function AnalyticsDashboard({ storeId }: AnalyticsDashboardProps) {
  const [overview, setOverview] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAnalyticsOverview(storeId),
      fetchTopProducts(storeId),
      fetchTopCategories(storeId),
      fetchRecentOrders(storeId),
      storeId ? Promise.resolve({ recentSignups: [] }) : fetchRecentSignups(),
    ])
      .then(([overviewData, topProductsData, topCategoriesData, recentOrdersData, recentSignupsData]) => {
        setOverview(overviewData);
        setTopProducts(topProductsData.topProducts || []);
        setTopCategories(topCategoriesData.topCategories || []);
        setRecentOrders(recentOrdersData.recentOrders || []);
        setRecentSignups(recentSignupsData.recentSignups || []);
      })
      .catch((e) => setError(e.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!overview) return <div>No analytics data available.</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`Rs ${overview.totalSales?.toLocaleString?.() ?? 0}`}
          icon={DollarSign}
          description="Total sales revenue."
        />
        <StatCard
          title="Order Volume"
          value={overview.orderVolume?.toLocaleString?.() ?? "0"}
          icon={ShoppingCart}
          description="Total number of orders."
        />
        {overview.recentSignups && (
          <StatCard
            title="Recent Signups"
            value={overview.recentSignups.length.toString()}
            icon={Users}
            description="Recent user registrations."
          />
        )}
        {/* Add more stat cards as needed */}
      </div>

      {/* Overview Chart */}
      {/* You can pass sales data to OverviewChart if available */}
      {/* <OverviewChart data={overview.salesData || []} /> */}

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div>No top products data.</div>
          ) : (
            <ul>
              {topProducts.map((p) => (
                <li key={p.productId} className="flex justify-between py-1">
                  <span>{p.name}</span>
                  <span>{p.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <div>No top categories data.</div>
          ) : (
            <ul>
              {topCategories.map((c) => (
                <li key={c.categoryId} className="flex justify-between py-1">
                  <span>{c.name}</span>
                  <span>{c.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div>No recent orders.</div>
          ) : (
            <ul>
              {recentOrders.map((order) => (
                <li key={order.id} className="flex justify-between py-1">
                  <span>{order.customerName || order.customerEmail}</span>
                  <span>Rs {order.total?.toLocaleString?.() ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent Signups (admin only) */}
      {!storeId && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSignups.length === 0 ? (
              <div>No recent signups.</div>
            ) : (
              <ul>
                {recentSignups.map((user) => (
                  <li key={user.id} className="flex justify-between py-1">
                    <span>{user.name || user.email}</span>
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 