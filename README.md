# NexusCart Studio - Multi-Tenant E-commerce Platform

A comprehensive NextJS-based e-commerce platform with multi-tenant architecture, real-time analytics, and subscription management.

## 🚀 Features

### Core Platform
- **Multi-tenant Architecture**: Each store operates independently with domain-based routing
- **Role-Based Access Control (RBAC)**: Admin, store owner, and customer roles with granular permissions
- **Subscription Management**: Plan-based feature restrictions and billing
- **Payment Integration**: Khalti and eSewa payment gateways
- **Real-time Analytics**: Comprehensive dashboard for admins and store owners

### Analytics Dashboard
- **Admin Analytics**: Global KPIs, top products, top categories, recent orders, and user signups
- **Store Analytics**: Store-specific KPIs, performance metrics, and order tracking
- **Real-time Data**: Live data from Firestore with efficient queries
- **Responsive UI**: Modern dashboard with charts, stat cards, and tables

## 📊 Analytics API Endpoints

### Overview Analytics
```bash
GET /api/analytics/overview
GET /api/analytics/overview?storeId={storeId}
```
Returns total sales, order volume, and recent signups (admin only).

### Top Performers
```bash
GET /api/analytics/top-products
GET /api/analytics/top-products?storeId={storeId}
GET /api/analytics/top-categories
GET /api/analytics/top-categories?storeId={storeId}
```
Returns top-selling products and categories with quantities sold.

### Recent Activity
```bash
GET /api/analytics/recent-orders
GET /api/analytics/recent-orders?storeId={storeId}
GET /api/analytics/recent-signups
```
Returns recent orders and user signups (admin only).

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Firebase project with Firestore
- Google Cloud Storage for image uploads

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure Firebase, payment gateways, and AI services

# Run development server
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run analytics API tests
npm test -- analytics-api.test.ts

# Run integration tests
npm test -- integration/
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/analytics/          # Analytics API endpoints
│   ├── (app)/dashboard/        # Store owner dashboard
│   └── (superadmin)/admin/     # Admin dashboard
├── components/
│   ├── admin/analytics-dashboard.tsx  # Analytics dashboard component
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── analytics-fetchers.ts   # Analytics API utilities
│   └── firebase-service.ts     # Firebase operations
└── __tests__/
    └── integration/analytics-api.test.ts  # API tests
```

## 🔧 Configuration

### Environment Variables
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Payment Gateways
KHALTI_SECRET_KEY=
ESEWA_MERCHANT_ID=
ESEWA_SECRET_KEY=

# AI Services
OPENAI_API_KEY=
```

### Firebase Security Rules
Ensure proper multi-tenant access control with store-based filtering.

## 📈 Analytics Dashboard Usage

### For Admins
1. Navigate to `/admin` dashboard
2. View global KPIs and performance metrics
3. Monitor all stores and user activity
4. Access recent signups and order data

### For Store Owners
1. Navigate to `/dashboard` (with store context)
2. View store-specific analytics
3. Track product and category performance
4. Monitor recent orders and sales

## 🧪 Testing

### API Tests
- Integration tests for all analytics endpoints
- Error handling and edge case coverage
- Multi-tenant data isolation verification

### Component Tests
- Analytics dashboard rendering
- Loading and error states
- Data fetching and display

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Firebase security rules deployed
- [ ] Payment gateway credentials set
- [ ] Analytics endpoints tested
- [ ] Dashboard components verified

### Performance Optimization
- Firestore query optimization
- Image compression and caching
- API response caching
- Bundle size optimization

## 📚 Documentation

- [Development Plan](./DEVELOPMENT_PLAN.md) - Detailed roadmap and guidelines
- [API Documentation](./docs/api.md) - Complete API reference
- [Testing Guide](./docs/testing.md) - Testing strategies and examples

## 🤝 Contributing

1. Follow the development guidelines in `DEVELOPMENT_PLAN.md`
2. Ensure all tests pass before submitting
3. Update documentation for new features
4. Follow the multi-tenant architecture patterns

## 📄 License

This project is proprietary software. All rights reserved.
