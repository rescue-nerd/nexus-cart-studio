"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Download,
  Activity
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import StatCard from "@/components/admin/stat-card";
import { OverviewChart } from "@/components/admin/overview-chart";
import {
  fetchAnalyticsOverview,
  fetchTopProducts,
  fetchTopCategories,
  fetchRecentOrders,
  fetchRecentSignups,
} from "@/lib/analytics-fetchers";

interface DateRange {
  from: Date;
  to: Date;
}

interface EnhancedAnalyticsData {
  totalSales: number;
  orderVolume: number;
  recentSignups: any[];
  conversionRate: number;
  averageOrderValue: number;
  growthRate: number;
  topProducts: any[];
  topCategories: any[];
  recentOrders: any[];
  salesTrend: { date: string; sales: number }[];
  orderTrend: { date: string; orders: number }[];
}

interface AnalyticsDashboardProps {
  storeId?: string;
  showAdvancedMetrics?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function EnhancedAnalyticsDashboard({ 
  storeId, 
  showAdvancedMetrics = true,
  refreshInterval = 300000 // 5 minutes
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, topProductsData, topCategoriesData, recentOrdersData, recentSignupsData] = await Promise.all([
        fetchAnalyticsOverview(storeId, timeRange),
        fetchTopProducts(storeId, timeRange),
        fetchTopCategories(storeId, timeRange),
        fetchRecentOrders(storeId, timeRange),
        storeId ? Promise.resolve({ recentSignups: [] }) : fetchRecentSignups(timeRange),
      ]);

      const enhancedData: EnhancedAnalyticsData = {
        totalSales: overviewData.totalSales || 0,
        orderVolume: overviewData.orderVolume || 0,
        recentSignups: recentSignupsData.recentSignups || [],
        conversionRate: overviewData.conversionRate || 0,
        averageOrderValue: overviewData.totalSales && overviewData.orderVolume 
          ? overviewData.totalSales / overviewData.orderVolume 
          : 0,
        growthRate: overviewData.growthRate || 0,
        topProducts: topProductsData.topProducts || [],
        topCategories: topCategoriesData.topCategories || [],
        recentOrders: recentOrdersData.recentOrders || [],
        salesTrend: overviewData.salesTrend || [],
        orderTrend: overviewData.orderTrend || [],
      };

      setData(enhancedData);
      setLastUpdated(new Date());
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [storeId, timeRange]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        setIsRefreshing(true);
        fetchData().finally(() => setIsRefreshing(false));
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  const handleExportCSV = () => {
    if (!data) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Sales', `Rs ${data.totalSales.toLocaleString()}`],
      ['Order Volume', data.orderVolume.toString()],
      ['Conversion Rate', `${data.conversionRate.toFixed(2)}%`],
      ['Average Order Value', `Rs ${data.averageOrderValue.toFixed(2)}`],
      ['Growth Rate', `${data.growthRate.toFixed(2)}%`],
      ['', ''],
      ['Top Products', 'Quantity Sold'],
      ...data.topProducts.map(p => [p.name, p.quantity.toString()]),
      ['', ''],
      ['Top Categories', 'Quantity Sold'],
      ...data.topCategories.map(c => [c.name, c.quantity.toString()]),
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGrowthIcon = (rate: number) => {
    return rate > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getGrowthColor = (rate: number) => {
    return rate > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          No analytics data available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: unknown) => setTimeRange(value as '7d' | '30d' | '90d' | '1y')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button 
            onClick={() => {
              setIsRefreshing(true);
              fetchData().finally(() => setIsRefreshing(false));
            }}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`Rs ${data.totalSales.toLocaleString()}`}
          icon={DollarSign}
          description="Total revenue generated"
          trend={data.growthRate}
        />
        <StatCard
          title="Order Volume"
          value={data.orderVolume.toLocaleString()}
          icon={ShoppingCart}
          description="Total orders placed"
          trend={data.growthRate}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data.conversionRate.toFixed(2)}%`}
          icon={Activity}
          description="Visitor to customer rate"
          trend={data.growthRate}
        />
        <StatCard
          title="Avg Order Value"
          value={`Rs ${data.averageOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          description="Average order size"
          trend={data.growthRate}
        />
      </div>

      {/* Advanced Metrics */}
      {showAdvancedMetrics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sales Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getGrowthIcon(data.growthRate)}
                <span className={`text-2xl font-bold ${getGrowthColor(data.growthRate)}`}>
                  {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length > 0 ? (
                <div>
                  <div className="font-medium">{data.topProducts[0].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.topProducts[0].quantity} units sold
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No data</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New Orders</span>
                  <Badge variant="secondary">{data.recentOrders.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Signups</span>
                  <Badge variant="secondary">{data.recentSignups.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="categories">Top Categories</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {data.salesTrend.length > 0 ? (
                  <OverviewChart data={data.salesTrend} />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No sales data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {data.orderTrend.length > 0 ? (
                  <OverviewChart data={data.orderTrend} />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No order data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.quantity} units sold
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rs {product.revenue?.toLocaleString() || 0}</div>
                        <div className="text-sm text-muted-foreground">
                          {((product.quantity / data.orderVolume) * 100).toFixed(1)}% of orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No product data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories by Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topCategories.length > 0 ? (
                <div className="space-y-4">
                  {data.topCategories.map((category, index) => (
                    <div key={category.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.quantity} units sold
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rs {category.revenue?.toLocaleString() || 0}</div>
                        <div className="text-sm text-muted-foreground">
                          {((category.quantity / data.orderVolume) * 100).toFixed(1)}% of orders
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {order.customerName || order.customerEmail}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.date ? format(new Date(order.date), 'MMM dd, yyyy') : 'Unknown date'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rs {order.total?.toLocaleString() || 0}</div>
                        <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent orders
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 