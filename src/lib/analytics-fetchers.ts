// Utility functions to fetch analytics data from API endpoints

export async function fetchAnalyticsOverview(storeId?: string) {
  const url = storeId
    ? `/api/analytics/overview?storeId=${encodeURIComponent(storeId)}`
    : `/api/analytics/overview`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics overview');
  return res.json();
}

export async function fetchTopProducts(storeId?: string) {
  const url = storeId
    ? `/api/analytics/top-products?storeId=${encodeURIComponent(storeId)}`
    : `/api/analytics/top-products`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch top products');
  return res.json();
}

export async function fetchTopCategories(storeId?: string) {
  const url = storeId
    ? `/api/analytics/top-categories?storeId=${encodeURIComponent(storeId)}`
    : `/api/analytics/top-categories`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch top categories');
  return res.json();
}

export async function fetchRecentOrders(storeId?: string) {
  const url = storeId
    ? `/api/analytics/recent-orders?storeId=${encodeURIComponent(storeId)}`
    : `/api/analytics/recent-orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recent orders');
  return res.json();
}

export async function fetchRecentSignups() {
  const res = await fetch('/api/analytics/recent-signups');
  if (!res.ok) throw new Error('Failed to fetch recent signups');
  return res.json();
} 