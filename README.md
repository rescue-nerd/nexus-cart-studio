# NexusCart - Multi-tenant E-commerce Platform

A comprehensive, multi-tenant e-commerce platform built with Next.js, Firebase, and TypeScript. Each store gets its own subdomain with a complete storefront, admin dashboard, and analytics.

## 🚀 Features

### Core E-commerce
- **Multi-tenant Architecture**: Each store gets its own subdomain (e.g., `mystore.yourplatform.com`)
- **Product Management**: Add, edit, delete products with images, descriptions, and inventory
- **Order Management**: Complete order lifecycle with status tracking
- **Shopping Cart**: Persistent cart with guest and user checkout
- **Payment Integration**: Support for Khalti, eSewa, QR codes, and bank transfers
- **Inventory Management**: Real-time stock tracking and low stock alerts

### Analytics & Insights
- **Real-time Analytics Dashboard**: Comprehensive store performance metrics
- **Enhanced Analytics**: Date range filters, export CSV, custom KPIs, growth tracking
- **Sales Trends**: Visual charts for sales and order trends
- **Product Analytics**: Top-selling products and categories
- **Customer Insights**: Order history and customer behavior

### User Activity & Audit Logging
- **Comprehensive Activity Logging**: Tracks all user actions, system events, and security incidents
- **Advanced Admin UI**: Real-time dashboard with filtering, search, and export capabilities
- **Security Monitoring**: Special tracking for security-related activities with severity levels
- **Audit Trail**: Complete audit trail for compliance requirements
- **Multi-tenant Isolation**: Store owners only see their store's logs
- **Export Functionality**: CSV export with comprehensive data and filtering

### Email Notifications
- **Transactional Emails**: Order confirmations, password resets, welcome emails
- **Admin Alerts**: New orders, low stock, payment failures
- **Email Templates**: Professional, customizable email templates
- **Multiple Providers**: SendGrid and SMTP support
- **Admin UI**: Email template management and testing interface

### User Management
- **Store Owner Registration**: Complete signup flow with store creation
- **Role-based Access Control**: Admin and store owner permissions
- **User Authentication**: Secure Firebase Auth integration
- **Profile Management**: Store settings and user preferences

### Store Customization
- **Store Settings**: Domain, payment methods, store information
- **Theme Customization**: Color schemes and branding options
- **SEO Settings**: Meta titles, descriptions, and keywords
- **Payment Configuration**: Multiple payment gateway setup

### Advanced Features
- **AI Integration**: Product description generation and SEO optimization
- **WhatsApp Notifications**: Order alerts via WhatsApp
- **Thermal Print Support**: Receipt printing for physical stores
- **Multi-language Support**: English and Nepali localization
- **PWA Support**: Progressive Web App capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes, Server Actions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage, Google Cloud Storage
- **Email**: SendGrid, Nodemailer
- **Payments**: Khalti, eSewa integration
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel, Firebase Hosting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- SendGrid account (for emails)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd nexus-cart-studio
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Store Name

# Alternative SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false

# Google Cloud Storage (Optional)
GCS_PROJECT_ID=your_gcs_project_id
GCS_BUCKET_NAME=your_bucket_name
GOOGLE_APPLICATION_CREDENTIALS_JSON=your_credentials_json

# AI Services (Optional)
OPENAI_API_KEY=your_openai_api_key
GOOGLE_AI_API_KEY=your_google_ai_key

# WhatsApp Integration (Optional)
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_NUMBER=your_whatsapp_number
```

4. **Initialize Email Service**
Add to your app initialization (e.g., `src/lib/config.ts`):

```typescript
import { initializeEmailService } from '@/lib/email-service';

// Initialize with SendGrid
initializeEmailService({
  fromEmail: process.env.EMAIL_FROM_ADDRESS!,
  fromName: process.env.EMAIL_FROM_NAME!,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
});
```

5. **Run the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## 🏗️ Project Structure

```
nexus-cart-studio/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (app)/             # Store owner routes
│   │   │   ├── dashboard/     # Analytics dashboard
│   │   │   ├── products/      # Product management
│   │   │   ├── orders/        # Order management
│   │   │   ├── settings/      # Store settings
│   │   │   └── activity-logs/ # Activity logs dashboard
│   │   ├── (superadmin)/      # Admin routes
│   │   │   └── admin/         # Admin dashboard
│   │   ├── api/               # API routes
│   │   │   ├── analytics/     # Analytics endpoints
│   │   │   ├── email/         # Email API
│   │   │   ├── activity-logs/ # Activity logs API
│   │   │   └── auth/          # Authentication
│   │   └── store/             # Public storefront
│   ├── components/            # React components
│   │   ├── admin/            # Admin dashboard components
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── enhanced-analytics-dashboard.tsx
│   │   │   ├── activity-logs-dashboard.tsx
│   │   │   ├── email-management.tsx
│   │   │   └── stat-card.tsx
│   │   ├── storefront/       # Storefront components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utility functions and services
│   │   ├── email-service.ts  # Email notification service
│   │   ├── email-utils.ts    # Email utility functions
│   │   ├── activity-log.ts   # Activity logging service
│   │   ├── analytics-fetchers.ts # Analytics API clients
│   │   ├── firebase-service.ts # Firebase operations
│   │   └── types.ts          # TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   └── locales/              # Internationalization
├── public/                   # Static assets
├── docs/                     # Documentation
└── scripts/                  # Build and migration scripts
```

## 📊 Analytics Dashboard

### Features
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Date Range Filters**: 7d, 30d, 90d, 1y time ranges
- **Export Capabilities**: CSV download for all metrics
- **Advanced KPIs**: Growth rates, conversion rates, trends
- **Interactive Charts**: Sales and order trend visualizations
- **Mobile Responsive**: Optimized for all devices

### Usage
```typescript
import { EnhancedAnalyticsDashboard } from '@/components/admin/enhanced-analytics-dashboard';

// Store owner dashboard
<EnhancedAnalyticsDashboard storeId="store-123" />

// Admin dashboard with advanced metrics
<EnhancedAnalyticsDashboard 
  showAdvancedMetrics={true}
  refreshInterval={300000} // 5 minutes
/>
```

## 📧 Email Notifications

### Email Types
- **Order Confirmations**: Sent to customers after purchase
- **Password Resets**: Secure reset links with expiry
- **Admin Alerts**: New orders, low stock, payment failures
- **Welcome Emails**: New user signup messages
- **Test Emails**: Configuration verification

### Setup
1. Configure SendGrid or SMTP in environment variables
2. Initialize email service in app startup
3. Use utility functions for common scenarios:

```typescript
import { sendNewOrderNotifications } from '@/lib/email-utils';

await sendNewOrderNotifications({
  orderId: 'order-123',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderTotal: 1500,
  orderItems: [...],
  storeName: 'My Store',
  storeId: 'store-123',
  adminEmail: 'admin@mystore.com',
});
```

## 📋 Activity Logs Dashboard

### Features
- **Real-time Monitoring**: Live activity tracking with auto-refresh
- **Advanced Filtering**: Search by user, action, category, severity, date range
- **Export Capabilities**: CSV export with comprehensive data
- **Drill-down Details**: Click to view detailed log information
- **Statistics Dashboard**: Success rates, category breakdown, trend analysis
- **Security Monitoring**: Special tracking for security-related activities
- **Multi-tenant Isolation**: Store owners only see their store's logs

### Usage
```typescript
import { ActivityLogsDashboard } from '@/components/admin/activity-logs-dashboard';

// Store owner dashboard
<ActivityLogsDashboard 
  storeId="store-123"
  showAdvancedMetrics={false}
  refreshInterval={300000} // 5 minutes
/>

// Admin dashboard with advanced metrics
<ActivityLogsDashboard 
  showAdvancedMetrics={true}
  refreshInterval={300000} // 5 minutes
/>
```

### Logging Examples
```typescript
import { logUserAction, logSecurityEvent, logFailedAction } from '@/lib/activity-log';

// Log user actions
await logUserAction(user, 'add_product', productId, { product }, req, {
  category: 'product',
  severity: 'medium',
  targetType: 'product',
  storeId: user.storeId,
});

// Log security events
await logSecurityEvent(user, 'failed_login', userId, { ip: '192.168.1.1' }, req, 'high');

// Log failed actions
await logFailedAction(user, 'update_product', productId, 'Database error', { updates }, req);
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="Activity"
npm test -- --testNamePattern="Email"
npm test -- --testNamePattern="Analytics"
npm test -- --testNamePattern="Dashboard"
```

### Test Coverage
- **Activity Logs**: Unit and integration tests for all logging functionality
- **Email Service**: Unit tests for all email functionality
- **Email API**: Integration tests for API endpoints
- **Analytics Dashboard**: Component tests with mocks
- **API Routes**: Integration tests for all endpoints

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy
firebase deploy
```

## 📚 Documentation

- [Development Plan](./DEVELOPMENT_PLAN.md) - Current status and roadmap
- [API Documentation](./docs/api.md) - API endpoints and usage
- [Email System](./EMAIL_NOTIFICATIONS_AND_DASHBOARD_IMPROVEMENTS.md) - Email notifications guide
- [Analytics Dashboard](./docs/analytics.md) - Dashboard features and usage
- [Activity Logs System](./ACTIVITY_LOGS_SYSTEM.md) - Activity logging guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the development plan for current status

## 🎯 Roadmap

### Completed ✅
- Multi-tenant architecture
- Product and order management
- Payment integrations
- Email notification system
- Enhanced analytics dashboard
- User activity/audit log admin UI
- Comprehensive testing suite

### In Progress 🔄
- AI-powered product descriptions
- WhatsApp notifications
- Advanced reporting features

### Planned 📋
- Customizable notification preferences
- Customer-facing features (order history, invoices)
- Performance monitoring integration
- Backup and recovery systems
- Mobile app development
- Advanced inventory management
- Customer loyalty program
- Multi-language expansion
