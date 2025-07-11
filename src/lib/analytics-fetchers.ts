// Utility functions to fetch analytics data from API endpoints

export async function fetchAnalyticsOverview(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/overview?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/overview?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export async function fetchTopProducts(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/top-products?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/top-products?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch top products');
  return res.json();
}

export async function fetchTopCategories(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/top-categories?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/top-categories?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch top categories');
  return res.json();
}

export async function fetchRecentOrders(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/recent-orders?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/recent-orders?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recent orders');
  return res.json();
}

export async function fetchRecentSignups(timeRange: string = '30d') {
  const url = `/api/analytics/recent-signups?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recent signups');
  return res.json();
}

// Enhanced analytics functions for the new dashboard
export async function fetchSalesTrend(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/sales-trend?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/sales-trend?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch sales trend');
  return res.json();
}

export async function fetchOrderTrend(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/order-trend?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/order-trend?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch order trend');
  return res.json();
}

export async function fetchGrowthMetrics(storeId?: string, timeRange: string = '30d') {
  const url = storeId
    ? `/api/analytics/growth-metrics?storeId=${encodeURIComponent(storeId)}&timeRange=${timeRange}`
    : `/api/analytics/growth-metrics?timeRange=${timeRange}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch growth metrics');
  return res.json();
} 