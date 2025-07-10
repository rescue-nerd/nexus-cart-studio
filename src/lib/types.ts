
export type Plan = {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxStorage: number; // in MB
    customDomain: boolean;
    aiFeatures: boolean;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PlanInput = Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>;
export type PlanUpdate = Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>;

export type Category = {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string; // For subcategories
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  storeId?: string; // For store-specific categories (null for global)
  productCount?: number; // Calculated field
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryInput = Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>;
export type CategoryUpdate = Partial<Omit<Category, 'id' | 'productCount' | 'createdAt' | 'updatedAt'>>;

export type PaymentSettings = {
  qrCodeUrl?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
  };
  khaltiSecretKey?: string;
  khaltiTestMode?: boolean;
  eSewaMerchantCode?: string;
  eSewaSecretKey?: string;
  eSewaTestMode?: boolean;
};

export type Store = {
  id:string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  productCount: number;
  orderCount: number;
  domain: string;
  planId: string;
  description?: string;
  whatsappNumber?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  userId: string;
  paymentSettings?: PaymentSettings;
  createdAt?: string;
};

export type Product = {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string;
  description: string;
  createdAt?: string;
};

export type OrderItem = {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
};

export type Order = {
  id:string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'COD' | 'QR' | 'Bank Transfer' | 'Khalti' | 'eSewa';
  date: string; // Should be ISO string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Failed' | 'Refunded';
  total: number;
  items: OrderItem[];
  paymentDetails?: {
    // Khalti
    pidx?: string;
    transactionId?: string;
    // eSewa
    transaction_uuid?: string;
    ref_id?: string;
  }
};
