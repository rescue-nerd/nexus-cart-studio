// Integration tests for analytics API endpoints using fetch (Next.js route handler style)

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Analytics API Endpoints', () => {
  it('should return analytics overview (global)', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/overview`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('totalSales');
    expect(body).toHaveProperty('orderVolume');
    expect(body).toHaveProperty('recentSignups');
  });

  it('should return analytics overview (store)', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/overview?storeId=test-store`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('totalSales');
    expect(body).toHaveProperty('orderVolume');
    expect(body.recentSignups).toEqual([]);
  });

  it('should return top products', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/top-products`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('topProducts');
    expect(Array.isArray(body.topProducts)).toBe(true);
  });

  it('should return top categories', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/top-categories`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('topCategories');
    expect(Array.isArray(body.topCategories)).toBe(true);
  });

  it('should return recent orders', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/recent-orders`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('recentOrders');
    expect(Array.isArray(body.recentOrders)).toBe(true);
  });

  it('should return recent signups', async () => {
    const res = await fetch(`${baseUrl}/api/analytics/recent-signups`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('recentSignups');
    expect(Array.isArray(body.recentSignups)).toBe(true);
  });

  it('should handle missing Firebase app error', async () => {
    // Simulate Firebase not initialized (mock or env)
    // This is a placeholder; adjust as needed for your setup
    expect(true).toBe(true); // Placeholder
  });
}); 