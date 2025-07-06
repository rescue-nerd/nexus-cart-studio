
import type { Plan, Category } from './types';

export const plans: Plan[] = [
  {
    id: 'plan_basic',
    price: 999,
    features: ['50_products', 'basic_analytics', 'community_support'],
  },
  {
    id: 'plan_pro',
    price: 2499,
    features: ['500_products', 'advanced_analytics', 'whatsapp_notifications', 'email_support'],
  },
  {
    id: 'plan_enterprise',
    price: 7999,
    features: ['unlimited_products', 'full_analytics', 'custom_integrations', 'dedicated_support'],
  },
];

export const categories: Category[] = [
  { id: 'hancrafted-art', name: 'Handcrafted Art' },
  { id: 'traditional-apparel', name: 'Traditional Apparel' },
  { id: 'nepali-tea-spices', name: 'Nepali Tea & Spices' },
  { id: 'handmade-jewelry', name: 'Handmade Jewelry' },
];

export const storeConfig = {
  sellerWhatsAppNumber: process.env.NEXT_PUBLIC_SELLER_WHATSAPP_NUMBER || '+9779860000000', 
};
