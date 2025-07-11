import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';

// Mock the analytics fetchers
jest.mock('@/lib/analytics-fetchers', () => ({
  fetchAnalyticsOverview: jest.fn(),
  fetchTopProducts: jest.fn(),
  fetchTopCategories: jest.fn(),
  fetchRecentOrders: jest.fn(),
  fetchRecentSignups: jest.fn(),
}));

import {
  fetchAnalyticsOverview,
  fetchTopProducts,
  fetchTopCategories,
  fetchRecentOrders,
  fetchRecentSignups,
} from '@/lib/analytics-fetchers';

describe('AnalyticsDashboard', () => {
  const overviewData = {
    totalSales: 123456,
    orderVolume: 789,
    recentSignups: [{ id: 'u1', name: 'Alice', email: 'alice@example.com', createdAt: Date.now() }],
  };
  const topProductsData = { topProducts: [
    { productId: 'p1', name: 'Product 1', quantity: 10 },
    { productId: 'p2', name: 'Product 2', quantity: 5 },
  ]};
  const topCategoriesData = { topCategories: [
    { categoryId: 'c1', name: 'Category 1', quantity: 20 },
    { categoryId: 'c2', name: 'Category 2', quantity: 8 },
  ]};
  const recentOrdersData = { recentOrders: [
    { id: 'o1', customerName: 'Bob', total: 1000 },
    { id: 'o2', customerEmail: 'eve@example.com', total: 2000 },
  ]};
  const recentSignupsData = { recentSignups: [
    { id: 'u2', name: 'Carol', email: 'carol@example.com', createdAt: Date.now() },
  ]};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<AnalyticsDashboard />);
    expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockRejectedValue(new Error('Test error'));
    (fetchTopProducts as jest.Mock).mockResolvedValue(topProductsData);
    (fetchTopCategories as jest.Mock).mockResolvedValue(topCategoriesData);
    (fetchRecentOrders as jest.Mock).mockResolvedValue(recentOrdersData);
    (fetchRecentSignups as jest.Mock).mockResolvedValue(recentSignupsData);
    render(<AnalyticsDashboard />);
    await waitFor(() => expect(screen.getByText(/test error/i)).toBeInTheDocument());
  });

  it('renders no data state', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockResolvedValue(null);
    (fetchTopProducts as jest.Mock).mockResolvedValue({ topProducts: [] });
    (fetchTopCategories as jest.Mock).mockResolvedValue({ topCategories: [] });
    (fetchRecentOrders as jest.Mock).mockResolvedValue({ recentOrders: [] });
    (fetchRecentSignups as jest.Mock).mockResolvedValue({ recentSignups: [] });
    render(<AnalyticsDashboard />);
    await waitFor(() => expect(screen.getByText(/no analytics data/i)).toBeInTheDocument());
  });

  it('renders all analytics data for admin (global)', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockResolvedValue(overviewData);
    (fetchTopProducts as jest.Mock).mockResolvedValue(topProductsData);
    (fetchTopCategories as jest.Mock).mockResolvedValue(topCategoriesData);
    (fetchRecentOrders as jest.Mock).mockResolvedValue(recentOrdersData);
    (fetchRecentSignups as jest.Mock).mockResolvedValue(recentSignupsData);
    render(<AnalyticsDashboard />);
    await waitFor(() => expect(screen.getByText(/total sales/i)).toBeInTheDocument());
    expect(screen.getByText(/rs 123,456/i)).toBeInTheDocument();
    expect(screen.getByText(/order volume/i)).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText(/recent signups/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/top products/i)).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/top categories/i)).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText(/recent orders/i)).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Rs 1,000')).toBeInTheDocument();
    expect(screen.getByText(/recent signups/i)).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('renders store dashboard (no recent signups card)', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockResolvedValue({ ...overviewData, recentSignups: undefined });
    (fetchTopProducts as jest.Mock).mockResolvedValue(topProductsData);
    (fetchTopCategories as jest.Mock).mockResolvedValue(topCategoriesData);
    (fetchRecentOrders as jest.Mock).mockResolvedValue(recentOrdersData);
    (fetchRecentSignups as jest.Mock).mockResolvedValue({ recentSignups: [] });
    render(<AnalyticsDashboard storeId="store-123" />);
    await waitFor(() => expect(screen.getByText(/total sales/i)).toBeInTheDocument());
    expect(screen.queryByText(/recent signups/i)).not.toBeInTheDocument();
  });

  it('handles no data for top products, categories, orders, signups', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockResolvedValue(overviewData);
    (fetchTopProducts as jest.Mock).mockResolvedValue({ topProducts: [] });
    (fetchTopCategories as jest.Mock).mockResolvedValue({ topCategories: [] });
    (fetchRecentOrders as jest.Mock).mockResolvedValue({ recentOrders: [] });
    (fetchRecentSignups as jest.Mock).mockResolvedValue({ recentSignups: [] });
    render(<AnalyticsDashboard />);
    await waitFor(() => expect(screen.getByText(/no top products data/i)).toBeInTheDocument());
    expect(screen.getByText(/no top categories data/i)).toBeInTheDocument();
    expect(screen.getByText(/no recent orders/i)).toBeInTheDocument();
    expect(screen.getByText(/no recent signups/i)).toBeInTheDocument();
  });

  it('reacts to storeId prop change (refetches data)', async () => {
    (fetchAnalyticsOverview as jest.Mock).mockResolvedValueOnce(overviewData).mockResolvedValueOnce({ ...overviewData, totalSales: 999 });
    (fetchTopProducts as jest.Mock).mockResolvedValue(topProductsData);
    (fetchTopCategories as jest.Mock).mockResolvedValue(topCategoriesData);
    (fetchRecentOrders as jest.Mock).mockResolvedValue(recentOrdersData);
    (fetchRecentSignups as jest.Mock).mockResolvedValue(recentSignupsData);
    const { rerender } = render(<AnalyticsDashboard storeId="store-1" />);
    await waitFor(() => expect(screen.getByText(/rs 123,456/i)).toBeInTheDocument());
    rerender(<AnalyticsDashboard storeId="store-2" />);
    await waitFor(() => expect(screen.getByText(/rs 999/i)).toBeInTheDocument());
  });
}); 