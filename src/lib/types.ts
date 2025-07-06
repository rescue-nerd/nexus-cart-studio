
export type Plan = {
  id: string;
  price: number;
  features: string[];
};

export type Category = {
  id: string;
  name: string;
};

export type PaymentSettings = {
  qrCodeUrl?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
  };
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
  paymentMethod: 'COD' | 'QR' | 'Bank Transfer';
  date: string; // Should be ISO string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
};
