# NexusCart API Documentation

## Analytics API Endpoints

The analytics API provides real-time data for dashboards and reporting. All endpoints support both global (admin) and store-specific (store owner) analytics.

### Base URL
```
http://localhost:3000/api/analytics
```

### Authentication
All endpoints require authentication. Store-specific endpoints require store context.

---

## Overview Analytics

### GET /api/analytics/overview

Returns key performance indicators including total sales, order volume, and recent signups.

#### Parameters
- `storeId` (optional): Store ID for store-specific analytics

#### Examples

**Global Analytics (Admin)**
```bash
curl -X GET "http://localhost:3000/api/analytics/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Store-Specific Analytics**
```bash
curl -X GET "http://localhost:3000/api/analytics/overview?storeId=store_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response Schema
```json
{
  "totalSales": 150000,
  "orderVolume": 45,
  "recentSignups": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

#### Notes
- `recentSignups` is only included for global analytics (admin)
- `totalSales` includes only completed orders (Delivered, Shipped, Processing)
- `orderVolume` includes all orders regardless of status

---

## Top Products Analytics

### GET /api/analytics/top-products

Returns top-selling products with quantities sold.

#### Parameters
- `storeId` (optional): Store ID for store-specific analytics

#### Examples

**Global Top Products**
```bash
curl -X GET "http://localhost:3000/api/analytics/top-products" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Store-Specific Top Products**
```bash
curl -X GET "http://localhost:3000/api/analytics/top-products?storeId=store_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response Schema
```json
{
  "topProducts": [
    {
      "productId": "prod_123",
      "name": "Premium Widget",
      "quantity": 150
    },
    {
      "productId": "prod_456",
      "name": "Standard Widget",
      "quantity": 120
    }
  ]
}
```

#### Notes
- Products are sorted by quantity sold (descending)
- Limited to top 5 products by default
- Includes all orders regardless of status

---

## Top Categories Analytics

### GET /api/analytics/top-categories

Returns top-selling categories with quantities sold.

#### Parameters
- `storeId` (optional): Store ID for store-specific analytics

#### Examples

**Global Top Categories**
```bash
curl -X GET "http://localhost:3000/api/analytics/top-categories" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Store-Specific Top Categories**
```bash
curl -X GET "http://localhost:3000/api/analytics/top-categories?storeId=store_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response Schema
```json
{
  "topCategories": [
    {
      "categoryId": "cat_123",
      "name": "Electronics",
      "quantity": 300
    },
    {
      "categoryId": "cat_456",
      "name": "Clothing",
      "quantity": 250
    }
  ]
}
```

#### Notes
- Categories are sorted by quantity sold (descending)
- Limited to top 5 categories by default
- Includes all orders regardless of status

---

## Recent Orders Analytics

### GET /api/analytics/recent-orders

Returns recent orders with customer details and totals.

#### Parameters
- `storeId` (optional): Store ID for store-specific analytics

#### Examples

**Global Recent Orders**
```bash
curl -X GET "http://localhost:3000/api/analytics/recent-orders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Store-Specific Recent Orders**
```bash
curl -X GET "http://localhost:3000/api/analytics/recent-orders?storeId=store_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response Schema
```json
{
  "recentOrders": [
    {
      "id": "order_123",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "total": 1500.00,
      "status": "Delivered",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

#### Notes
- Orders are sorted by creation date (descending)
- Limited to 5 most recent orders by default
- Includes all order statuses

---

## Recent Signups Analytics

### GET /api/analytics/recent-signups

Returns recent user signups (admin only).

#### Examples

```bash
curl -X GET "http://localhost:3000/api/analytics/recent-signups" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Response Schema
```json
{
  "recentSignups": [
    {
      "id": "user_123",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2025-01-10T10:30:00Z"
    }
  ]
}
```

#### Notes
- Admin-only endpoint
- Users are sorted by signup date (descending)
- Limited to 5 most recent signups by default

---

## Error Handling

All endpoints return consistent error responses:

### Error Response Schema
```json
{
  "error": "Error message describing the issue"
}
```

### Common HTTP Status Codes
- `200`: Success
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (invalid store ID)
- `500`: Internal server error

### Example Error Response
```bash
curl -X GET "http://localhost:3000/api/analytics/overview" \
  -H "Authorization: Bearer INVALID_TOKEN"
```

```json
{
  "error": "Failed to fetch analytics overview"
}
```

---

## Rate Limiting

- **Analytics endpoints**: 100 requests per minute per user
- **Store-specific endpoints**: 200 requests per minute per store

---

## Data Freshness

- **Real-time**: All data is fetched directly from Firestore
- **Caching**: No client-side caching implemented
- **Updates**: Data reflects current state of the database

---

## Usage Examples

### JavaScript/TypeScript
```typescript
import { 
  fetchAnalyticsOverview, 
  fetchTopProducts, 
  fetchTopCategories 
} from '@/lib/analytics-fetchers';

// Global analytics (admin)
const overview = await fetchAnalyticsOverview();

// Store-specific analytics
const storeOverview = await fetchAnalyticsOverview('store_123');
const topProducts = await fetchTopProducts('store_123');
```

### React Component
```tsx
import { useEffect, useState } from 'react';
import { fetchAnalyticsOverview } from '@/lib/analytics-fetchers';

function AnalyticsDashboard({ storeId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalyticsOverview(storeId)
      .then(setData)
      .catch(console.error);
  }, [storeId]);

  return (
    <div>
      <h2>Total Sales: {data?.totalSales}</h2>
      <h2>Order Volume: {data?.orderVolume}</h2>
    </div>
  );
}
```

---

## Testing

Run the analytics API tests:

```bash
npm test -- analytics-api.test.ts
```

The test suite covers:
- All endpoint responses
- Error handling
- Store-specific filtering
- Data structure validation 