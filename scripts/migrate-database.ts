#!/usr/bin/env tsx
/**
 * Database Migration Script for NexusCart
 * Migrates static categories and plans to Firestore collections
 * 
 * Usage: npm run migrate
 */

import { adminDb } from '../src/lib/firebase-admin';
import { Plan, Category } from '../src/lib/types';

// Enhanced plans with new structure
const MIGRATION_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 999, // NPR
    billingCycle: 'monthly',
    features: [
      'Up to 50 products',
      'Unlimited orders',
      'Basic analytics',
      'Standard support',
      'Mobile responsive storefront'
    ],
    limits: {
      maxProducts: 50,
      maxOrders: -1, // unlimited
      maxStorage: 500, // 500MB
      customDomain: false,
      aiFeatures: false,
      advancedAnalytics: false,
      prioritySupport: false
    },
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'business',
    name: 'Business',
    price: 2499, // NPR
    billingCycle: 'monthly',
    features: [
      'Up to 500 products',
      'Unlimited orders',
      'Advanced analytics',
      'AI product descriptions',
      'Priority support',
      'Custom domain',
      'WhatsApp notifications'
    ],
    limits: {
      maxProducts: 500,
      maxOrders: -1,
      maxStorage: 2000, // 2GB
      customDomain: true,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: true
    },
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4999, // NPR
    billingCycle: 'monthly',
    features: [
      'Unlimited products',
      'Unlimited orders',
      'Advanced analytics & reporting',
      'Full AI features',
      'Priority support',
      'Custom domain',
      'WhatsApp & email notifications',
      'Multi-currency support',
      'Advanced SEO tools'
    ],
    limits: {
      maxProducts: -1, // unlimited
      maxOrders: -1,
      maxStorage: 10000, // 10GB
      customDomain: true,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: true
    },
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  }
];

// Enhanced categories with new structure
const MIGRATION_CATEGORIES: Category[] = [
  {
    id: 'handcrafted-art',
    name: 'Handcrafted Art',
    description: 'Beautiful handmade art pieces and traditional crafts',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'traditional-apparel',
    name: 'Traditional Apparel',
    description: 'Authentic traditional clothing and accessories',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'nepali-tea-spices',
    name: 'Nepali Tea & Spices',
    description: 'Premium tea leaves and aromatic spices from Nepal',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'handmade-jewelry',
    name: 'Handmade Jewelry',
    description: 'Exquisite handcrafted jewelry and ornaments',
    isActive: true,
    displayOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    description: 'Traditional and modern home decoration items',
    isActive: true,
    displayOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    isActive: true,
    displayOrder: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    description: 'Books, educational materials, and office supplies',
    isActive: true,
    displayOrder: 7,
    createdAt: new Date().toISOString()
  }
];

async function migratePlans() {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  console.log('🚀 Migrating subscription plans...');
  
  const batch = adminDb.batch();
  
  for (const plan of MIGRATION_PLANS) {
    const planRef = adminDb.collection('plans').doc(plan.id);
    batch.set(planRef, plan);
    console.log(`✅ Added plan: ${plan.name} (${plan.id})`);
  }
  
  await batch.commit();
  console.log(`✅ Successfully migrated ${MIGRATION_PLANS.length} plans`);
}

async function migrateCategories() {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  console.log('🚀 Migrating product categories...');
  
  const batch = adminDb.batch();
  
  for (const category of MIGRATION_CATEGORIES) {
    const categoryRef = adminDb.collection('categories').doc(category.id);
    batch.set(categoryRef, category);
    console.log(`✅ Added category: ${category.name} (${category.id})`);
  }
  
  await batch.commit();
  console.log(`✅ Successfully migrated ${MIGRATION_CATEGORIES.length} categories`);
}

async function updateExistingStores() {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  console.log('🚀 Updating existing stores with default plan...');
  
  const storesSnapshot = await adminDb.collection('stores').get();
  const batch = adminDb.batch();
  
  storesSnapshot.docs.forEach(doc => {
    const storeData = doc.data();
    if (!storeData.planId) {
      batch.update(doc.ref, { 
        planId: 'starter',
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Updated store: ${storeData.name || doc.id} with starter plan`);
    }
  });
  
  if (!storesSnapshot.empty) {
    await batch.commit();
    console.log(`✅ Updated ${storesSnapshot.size} stores`);
  }
}

async function createIndexes() {
  console.log('📋 Creating recommended Firestore indexes...');
  console.log(`
To create the necessary indexes, run these commands in your terminal:

# Categories indexes
firebase firestore:indexes

# Or manually create via Firebase Console:
# Collection: categories
# Fields: isActive (Ascending), displayOrder (Ascending)
# Fields: storeId (Ascending), isActive (Ascending), displayOrder (Ascending)

# Plans indexes  
# Collection: plans
# Fields: isActive (Ascending), displayOrder (Ascending)

# Products indexes (update existing)
# Collection: products
# Fields: storeId (Ascending), category (Ascending), createdAt (Descending)
`);
}

async function runMigration() {
  try {
    console.log('🎯 Starting NexusCart Database Migration...\n');
    
    await migratePlans();
    console.log('');
    
    await migrateCategories();
    console.log('');
    
    await updateExistingStores();
    console.log('');
    
    await createIndexes();
    
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your application code to use the new API endpoints');
    console.log('2. Test the admin UI for managing categories and plans');
    console.log('3. Create Firestore indexes as shown above');
    console.log('4. Remove the old static config file');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => process.exit(0));
}

export { runMigration, migratePlans, migrateCategories };
