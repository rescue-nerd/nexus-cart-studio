
# NexusCart Technical Handoff & System Overview

**Date:** {current_date}
**Version:** 1.5 - Post-Route-Protection

This document provides a comprehensive overview of the NexusCart application's architecture, database schema, feature status, and deployment requirements. It is intended for developers, project managers, and new team members.

**Core Architecture:** The application is built on a Next.js App Router framework. The backend logic is handled via **Next.js Server Actions** and **Genkit AI flows**, which interact with a **Firebase Firestore** database.

---

## 1. Database Schema

**Current Status:** All data is persisted in **Firebase Firestore**. The schema below reflects the collections and data structures in use.

### A. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        string user_id PK
        string name
        string email UK
        string role
        datetime created_at
    }

    STORES {
        string store_id PK
        string user_id FK
        string store_name
        string subdomain UK
        string plan_id FK
        string theme
        string language
        json payment_settings
        datetime created_at
    }

    PLANS {
        string plan_id PK
        string name UK
        decimal price
        json features
        boolean is_active
    }

    STORE_SUBSCRIPTIONS {
        string subscription_id PK
        string store_id FK
        string plan_id FK
        string status
        datetime start_date
        datetime end_date
    }

    PRODUCTS {
        string product_id PK
        string store_id FK
        string name
        text description
        decimal price
        string sku
        int stock
        string image_url
        string category_id FK
        datetime created_at
        datetime updated_at
    }

    PRODUCT_CATEGORIES {
        string category_id PK
        string store_id FK
        string name
        string slug
        string parent_id FK
    }

    ORDERS {
        string order_id PK
        string store_id FK
        string user_id FK "nullable"
        string status
        decimal total_amount
        string payment_method
        text shipping_address
        string customer_name
        string customer_email
        string customer_phone
        datetime created_at
    }

    ORDER_ITEMS {
        string order_item_id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal price
    }

    PAYMENTS {
        string payment_id PK
        string order_id FK
        string gateway
        decimal amount
        string status
        string transaction_id
        datetime payment_date
    }

    NOTIFICATIONS {
      string notification_id PK
      string store_id FK
      string event
      string recipient
      text message
      string status
      datetime sent_at
    }

    ACTIVITY_LOGS {
        string log_id PK
        string store_id FK
        string user_id FK
        string action
        text details
        datetime created_at
    }

    USERS ||--o{ STORES : "owns"
    STORES ||--o{ PRODUCTS : "has"
    STORES ||--o{ ORDERS : "receives"
    STORES ||--o{ PRODUCT_CATEGORIES : "defines"
    STORES ||--|{ STORE_SUBSCRIPTIONS : "has"
    PLANS ||--o{ STORE_SUBSCRIPTIONS : "is"
    ORDERS ||--|{ PAYMENTS : "has"
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "is_in"
    PRODUCT_CATEGORIES ||--o{ PRODUCTS : "groups"
```

### B. Table/Collection Breakdown

| Collection Name        | Status                                   | Description                                                                 |
| ---------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| **Users**              | Implemented (Firebase Auth)              | Stores user account information. Firebase Auth is the source of truth.      |
| **stores**             | Implemented (Firestore)                  | Core collection for all stores created on the platform.                     |
| **products**           | Implemented (Firestore)                  | All products listed by a store.                                             |
| **Product Categories** | Implemented (Static Config)              | Categories are defined in `src/lib/config.ts`. Not a dynamic collection yet. |
| **orders**             | Implemented (Firestore)                  | Records all customer orders for a store.                                    |
| **Order Items**        | Implemented (Sub-collection of `orders`) | Line items are stored as an array within each Order document.               |
| **Payments**           | Not Implemented                          | Tracks payment transactions associated with orders.                         |
| **Plans**              | Implemented (Static Config)              | Available subscription plans are defined in `src/lib/config.ts`.            |
| **Store Subscriptions**| Not Implemented                          | Associates a store with a specific plan and tracks its subscription status. |
| **Notifications**      | Not Implemented (Logic is ephemeral)     | Logs all outgoing notifications (WhatsApp, Email) for tracking.             |
| **Activity Logs**      | Not Started                              | Logs significant actions performed by users within a store.                 |
| **Store Settings**     | Implemented (Fields on `stores` doc)     | Key-value store for various store-specific settings.                        |
| **Themes**             | Implemented (Handled by CSS)             | Theme configurations are handled by CSS variables in `globals.css`.         |
| **Translations**       | Implemented (Handled by JSON files)      | All text is managed via `src/locales` JSON files.                           |

---

## 2. Features – Status Checklist

### Features 100% Complete
- **User Authentication (Firebase)**: Fully functional login and signup using Firebase Auth. UI and backend logic are complete.
- **Route Protection & Session Management**: The `middleware.ts` file provides robust, domain-aware route protection.
  - **Authentication**: It checks for a secure, HTTP-only `session` cookie on all protected routes (`/dashboard`, `/admin`, etc.). Unauthenticated users are redirected to the login page.
  - **Authorization**: It separates superadmin and store owner access based on the domain. The `/admin` routes are only accessible on the main platform domain, while store management routes (`/dashboard`, `/products`, etc.) are only accessible on a store's specific subdomain.
  - **Session Management**: The session cookie itself is created via the `/api/auth/session` API route upon successful login. This API verifies the user's Firebase ID token using the Firebase Admin SDK and then sets the secure cookie.
- **Database Persistence (Firestore)**: All application data (Stores, Products, Orders) is now persisted in Firebase Firestore. All Server Actions correctly interact with the database via the service layer in `src/lib/firebase-service.ts`.
- **Theme/Color Selection**: Theming system is fully implemented with 7+ themes. Users can select a theme, and it's applied across the dashboard and storefront. State is persisted in `localStorage`.
- **Multilingual Support**: The entire UI is translated into English and Nepali. A `useTranslation` hook and language files (`/src/locales`) manage all text. User preference is persisted.
- **AI Product Description (UI/Backend)**: The "Generate with AI" buttons on the Add/Edit Product pages are fully functional, calling a Genkit flow to populate the description field.
- **PWA Support**: The application is configured as a Progressive Web App with a manifest file and service worker registration.
- **Manual Payment Gateway Configuration**: Store owners can configure their own payment details for "Cash on Delivery," "QR Code Payments," and "Bank Transfers" via the settings dashboard. This includes QR code image uploads and structured bank account details.
- **Manual Checkout Flow**: The storefront checkout process is fully implemented for COD, QR, and Bank Transfer methods. It dynamically displays the store-specific payment information to the customer and creates orders in Firestore with a "Processing" or "Pending" status for manual verification by the seller.
- **Khalti Payment Gateway Integration**:
    - **Configuration**: Store owners can add their Khalti secret keys and toggle test mode in the settings panel.
    - **Checkout**: Customers can pay via Khalti, which redirects them to the Khalti payment portal.
    - **Verification**: The system automatically verifies payments on the backend via the Khalti lookup API before confirming an order.
    - **Refunds**: Store owners can initiate full refunds for Khalti transactions directly from the order details page.
- **eSewa Payment Gateway Integration**:
    - **Configuration**: Store owners can add their eSewa Merchant Code and Secret Key, and toggle test mode in the settings panel.
    - **Checkout**: Customers can pay via eSewa. The system generates a signed form that auto-submits, redirecting the user to the eSewa payment page.
    - **Verification**: The system automatically verifies payments on the backend via the eSewa Status Check API after the user is redirected back to the app. Orders are only confirmed upon successful verification.
- **Admin Actions (UI & Logic)**:
    - Products: "Add", "Edit", and "Delete" are fully functional, persisting to Firestore.
    - Orders: "View Details," "Mark as Shipped," "Cancel Order," and "Refund Khalti Order" are functional, persisting to Firestore.
    - Settings: Saving "Store Profile," "SEO," and "Payments" changes works, persisting to Firestore.
    - Superadmin: "Add New Store" and store status changes are fully implemented, persisting to Firestore.

### UI/Foundation Only (Backend Logic is Mocked or Incomplete)
- **Plan Management & Subscription Logic**: UI for changing plans is complete. The backend action updates the store's `planId` in Firestore but does not handle billing, payments, or subscription lifecycle events (e.g., renewals, cancellations).
- **Product Category Management**: UI does not exist for dynamic category management. Categories are currently static and defined in a config file.

### Features Not Started
- **Activity Logs**: No UI or backend logic exists for logging user actions.
- **Real-time Analytics**: The dashboard uses static, randomized analytics data.
- **Email Notifications**: No infrastructure or logic exists for sending emails.
- **CI/CD Pipeline**: No deployment automation is configured.

---

## 3. Backend Logic & "API" Documentation

The application uses **Next.js Server Actions** and **API Routes** for backend logic. All actions are defined in `src/app/.../actions.ts` files and interact with the database via `src/lib/firebase-service.ts`.

### Module: Authentication (`/app/api/auth/session/route.ts`)
- `POST /api/auth/session`: Accepts a Firebase ID Token from the client. Verifies it using the Firebase Admin SDK and sets a secure, HTTP-only `session` cookie.
- `DELETE /api/auth/session`: Clears the `session` cookie, effectively logging the user out from the server's perspective.

### Module: Products (`/app/(app)/products/actions.ts`)
- `addProduct(formData)`: Adds a new product. Uploads image via `storage-service`, creates a new document in the `products` collection in Firestore, and revalidates the path.
- `updateProduct(productId, formData)`: Updates an existing product document in Firestore.
- `deleteProduct(productId)`: Deletes a product document from Firestore.
- `generateDescriptionAction(productName)`: Calls the Genkit flow to generate a product description.

### Module: Orders (`/app/(app)/orders/actions.ts`)
- `updateOrderStatus(orderId, status, lang)`: Updates the status of an order document in Firestore.
- `refundKhaltiOrder(orderId)`: Initiates a full refund for a completed Khalti transaction. It calls the Khalti Refund API and updates the order status to "Refunded" in Firestore upon success.

### Module: Settings (`/app/(app)/settings/actions.ts`)
- `updateStoreProfile(storeId, formData)`: Updates a store document's name and description in Firestore.
- `updateStorePlan(storeId, newPlanId)`: Updates a store document's planId in Firestore.
- `updatePaymentSettings(storeId, formData)`: Updates a store's payment details, including QR code, bank info, **Khalti credentials**, and **eSewa credentials**.
- `updateSeoSettings(storeId, data)`: Updates a store document's meta fields in Firestore.
- `suggestKeywordsAction(description)`: Calls Genkit flow to suggest SEO keywords.

### Module: Checkout (`/app/store/checkout/actions.ts`)
- `placeManualOrder(values, cartItems, lang)`: The main checkout handler for manual methods (COD, QR, Bank). Creates an order with 'Pending' or 'Processing' status.
- `initiateKhaltiPayment(values, cartItems)`: Handles the Khalti checkout process. It creates a preliminary order in Firestore, initiates a payment with Khalti's API, and returns the payment URL for redirection.
- `initiateESewaPayment(values, cartItems)`: Handles the eSewa checkout. It creates a preliminary order, generates a secure signature, and returns the necessary form data to the client for auto-redirection to eSewa.

### Module: Khalti Callback (`/app/store/checkout/khalti/callback/actions.ts`)
- `verifyKhaltiPayment(pidx)`: Called on the server after the user returns from Khalti. It uses the `pidx` to call Khalti's lookup API, verifies the transaction status, and updates the final order status in Firestore ('Processing' or 'Cancelled').

### Module: eSewa Callback (`/app/store/checkout/esewa/callback/actions.ts`)
- `verifyESewaPayment(base64Data)`: Called after the user returns from eSewa. It decodes the Base64 data, verifies the signature, and makes a server-to-server call to eSewa's Status Check API to confirm the transaction before updating the order status in Firestore.

### Module: AI & Notifications
- **AI Flows (`/src/ai/flows/*.ts`):** Genkit flows for product description generation, SEO keyword suggestion, and a chat assistant. They are self-contained and called by Server Actions.

### Third-Party Integrations
- **Firebase**: For user authentication (Client SDK), database (Firestore), and server-side session management (Admin SDK). Fully implemented.
- **Genkit (Google AI)**: For all AI features. Fully implemented.
- **Khalti**: For real-time payments and refunds. Fully implemented.
- **eSewa**: For real-time payments. Fully implemented.
- **Google Cloud Storage**: For image uploads. Implemented and fully functional.

---

## 4. What’s Live, What’s Not

### Live & Production-Ready (Conceptually)
- User Authentication (Login, Signup).
- **Route Protection & Session Management**: All admin and dashboard routes are now protected by domain-aware middleware that requires a valid server-side session cookie.
- The entire data layer and database persistence via Firebase Firestore.
- The entire user interface, including multilingual support and theme selection.
- All admin actions and forms, which are correctly wired to server actions that modify the database.
- AI features for content generation.
- PWA configuration.
- Manual payment configuration (QR, Bank, COD) by store owners.
- **Khalti Payment Gateway**: End-to-end payment processing, including configuration, checkout, server-side verification, and refunds.
- **eSewa Payment Gateway**: End-to-end payment processing, including configuration, checkout, and server-side verification.

### UI Only / Mocked Backend
- **Subscription Billing**: The app does not handle recurring payments or subscription lifecycle management.
- **Real-time Analytics**: The dashboard uses randomized data, not real aggregates from the database.

### Not Started
- eSewa Refunds (API not provided).
- Activity logs and auditing.
- Email sending infrastructure.
- Database backups, migrations, and seeding strategy.

---

## 5. Deployment, Security, and Tech Stack

### Tech Stack
- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Client & Admin SDKs)
- **UI**: React 18, Tailwind CSS, ShadCN UI
- **AI**: Google AI via Genkit
- **File Storage**: Google Cloud Storage

### Environment Variables
The following variables must be set in a `.env` file for full functionality. **Missing variables will cause features to run in a simulated/degraded mode.**

```env
# Firebase Client SDK (Required for client-side Auth & DB)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Required for server-side session management & route protection)
# The full JSON key file content for your Firebase service account, as a single-line string.
# Get this from Firebase Console > Project Settings > Service accounts > Generate new private key
FIREBASE_ADMIN_SDK_JSON=

# Google Cloud Storage (Required for real image uploads)
GCS_PROJECT_ID=
GCS_BUCKET_NAME=
# The full JSON key file content as a single-line string
GOOGLE_APPLICATION_CREDENTIALS_JSON=
```

### Security Measures
- **Authentication**: Handled by Firebase Auth, which is robust and secure.
- **Input Validation**: Client-side validation is performed with `zod` and `react-hook-form`. Basic server-side checks are present in most actions.
- **Route Protection & Session Management**: Route protection is handled by `middleware.ts`. It provides domain-aware authentication (checking for a secure, HTTP-only `session` cookie) and authorization (ensuring admin routes are on the main domain and app routes are on subdomains). The session cookie is created via the `/api/auth/session` API route upon successful login, creating a secure bridge between client-side authentication and server-side route protection.
- **CORS**: Handled by Next.js defaults.
- **Password Storage**: Handled securely by Firebase.

### Recommendations
- **Implement Firestore Security Rules**: Add robust security rules to your Firestore database to prevent unauthorized data access directly from the client.
- **Implement Role-Based Access Control (RBAC)**: Enforce user roles (e.g., 'store_owner', 'super_admin') in server actions to prevent unauthorized data access.

---

## 6. Additional Notes & Recommendations

### Technical Debt & Refactoring
1.  **Static Data in Config**: Plans and Categories are currently hardcoded in `src/lib/config.ts`. For more flexibility, these could be migrated to their own Firestore collections.
2.  **Analytics Data**: The dashboard analytics are currently randomized. A real implementation should aggregate data from the `orders` collection.

### Best Practices & Next Steps
1.  **Set Up Logging and Monitoring**: Integrate a service like Sentry or Logtail for error tracking and application monitoring.
2.  **Define Firestore Security Rules**: This is crucial for securing your database before going to production.
3.  **Create a CI/CD Pipeline**: Automate testing and deployment using GitHub Actions or a similar service.

### Blockers
- **External Service Credentials**: Full functionality for certain features (GCS, Firebase Admin) is blocked pending the acquisition and configuration of API keys and credentials.
