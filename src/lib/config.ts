
import type { Plan, Category } from './types';

// Note: Plans and categories are now managed dynamically via Firestore
// These static exports are kept for backward compatibility during migration
// Use PlanService and CategoryService for new functionality

export const plans: Plan[] = [
  {
    id: 'plan_basic',
    name: 'Basic Plan',
    price: 999,
    billingCycle: 'monthly',
    features: ['50_products', 'basic_analytics', 'community_support'],
    limits: {
      maxProducts: 50,
      maxOrders: 1000,
      maxStorage: 100,
      customDomain: false,
      aiFeatures: false,
      advancedAnalytics: false,
      prioritySupport: false,
    },
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'plan_pro',
    name: 'Professional Plan',
    price: 2499,
    billingCycle: 'monthly',
    features: ['500_products', 'advanced_analytics', 'whatsapp_notifications', 'email_support'],
    limits: {
      maxProducts: 500,
      maxOrders: 10000,
      maxStorage: 500,
      customDomain: true,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: false,
    },
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Plan',
    price: 7999,
    billingCycle: 'monthly',
    features: ['unlimited_products', 'full_analytics', 'custom_integrations', 'dedicated_support'],
    limits: {
      maxProducts: -1,
      maxOrders: -1,
      maxStorage: 2000,
      customDomain: true,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    isActive: true,
    displayOrder: 3,
  },
];

export const categories: Category[] = [
  { 
    id: 'handcrafted-art', 
    name: 'Handcrafted Art',
    description: 'Beautiful handcrafted art pieces and traditional artwork',
    isActive: true,
    displayOrder: 1,
    storeId: undefined,
  },
  { 
    id: 'traditional-apparel', 
    name: 'Traditional Apparel',
    description: 'Traditional Nepali clothing and ethnic wear',
    isActive: true,
    displayOrder: 2,
    storeId: undefined,
  },
  { 
    id: 'nepali-tea-spices', 
    name: 'Nepali Tea & Spices',
    description: 'Authentic Nepali tea blends and aromatic spices',
    isActive: true,
    displayOrder: 3,
    storeId: undefined,
  },
  { 
    id: 'handmade-jewelry', 
    name: 'Handmade Jewelry',
    description: 'Traditional and contemporary handmade jewelry pieces',
    isActive: true,
    displayOrder: 4,
    storeId: undefined,
  },
];

export const storeConfig = {};
