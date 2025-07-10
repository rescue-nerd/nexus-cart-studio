import 'dotenv/config';
import { adminDb } from '../src/lib/firebase-admin';

// Migration data from config
const plansData = [
  {
    id: 'plan_basic',
    name: 'Basic Plan',
    price: 999,
    billingCycle: 'monthly' as const,
    features: ['50_products', 'basic_analytics', 'community_support'],
    limits: {
      maxProducts: 50,
      maxOrders: 1000,
      maxStorage: 100, // 100MB
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
    billingCycle: 'monthly' as const,
    features: ['500_products', 'advanced_analytics', 'whatsapp_notifications', 'email_support'],
    limits: {
      maxProducts: 500,
      maxOrders: 10000,
      maxStorage: 500, // 500MB
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
    billingCycle: 'monthly' as const,
    features: ['unlimited_products', 'full_analytics', 'custom_integrations', 'dedicated_support'],
    limits: {
      maxProducts: -1, // unlimited
      maxOrders: -1, // unlimited
      maxStorage: 2000, // 2GB
      customDomain: true,
      aiFeatures: true,
      advancedAnalytics: true,
      prioritySupport: true,
    },
    isActive: true,
    displayOrder: 3,
  },
];

const categoriesData = [
  {
    id: 'handcrafted-art',
    name: 'Handcrafted Art',
    description: 'Beautiful handcrafted art pieces and traditional artwork',
    isActive: true,
    displayOrder: 1,
    storeId: null, // Global category
  },
  {
    id: 'traditional-apparel',
    name: 'Traditional Apparel',
    description: 'Traditional Nepali clothing and ethnic wear',
    isActive: true,
    displayOrder: 2,
    storeId: null, // Global category
  },
  {
    id: 'nepali-tea-spices',
    name: 'Nepali Tea & Spices',
    description: 'Authentic Nepali tea blends and aromatic spices',
    isActive: true,
    displayOrder: 3,
    storeId: null, // Global category
  },
  {
    id: 'handmade-jewelry',
    name: 'Handmade Jewelry',
    description: 'Traditional and contemporary handmade jewelry pieces',
    isActive: true,
    displayOrder: 4,
    storeId: null, // Global category
  },
];

async function migratePlans() {
  console.log('Starting plans migration...');
  
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  const plansRef = adminDb.collection('plans');
  
  // Check if plans already exist
  const existingPlans = await plansRef.get();
  if (!existingPlans.empty) {
    console.log('Plans already exist, skipping migration');
    return;
  }

  for (const plan of plansData) {
    try {
      await plansRef.add({
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Migrated plan: ${plan.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate plan ${plan.name}:`, error);
    }
  }
  
  console.log('Plans migration completed');
}

async function migrateCategories() {
  console.log('Starting categories migration...');
  
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  const categoriesRef = adminDb.collection('categories');
  
  // Check if categories already exist
  const existingCategories = await categoriesRef.get();
  if (!existingCategories.empty) {
    console.log('Categories already exist, skipping migration');
    return;
  }

  for (const category of categoriesData) {
    try {
      await categoriesRef.add({
        ...category,
        productCount: 0, // Will be calculated later
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Migrated category: ${category.name}`);
    } catch (error) {
      console.error(`❌ Failed to migrate category ${category.name}:`, error);
    }
  }
  
  console.log('Categories migration completed');
}

async function updateProductCounts() {
  console.log('Updating product counts for categories...');
  
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized');
  }

  const productsRef = adminDb.collection('products');
  const categoriesRef = adminDb.collection('categories');
  
  // Get all products
  const productsSnapshot = await productsRef.get();
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Count products per category
  const categoryCounts: { [categoryId: string]: number } = {};
  
  products.forEach(product => {
    const categoryId = product.category;
    categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
  });
  
  // Update category product counts
  const categoriesSnapshot = await categoriesRef.get();
  
  for (const categoryDoc of categoriesSnapshot.docs) {
    const categoryData = categoryDoc.data();
    const count = categoryCounts[categoryData.id] || 0;
    
    if (categoryData.productCount !== count) {
      await categoryDoc.ref.update({
        productCount: count,
        updatedAt: new Date().toISOString(),
      });
      console.log(`✅ Updated ${categoryData.name}: ${count} products`);
    }
  }
  
  console.log('Product counts updated');
}

async function main() {
  try {
    console.log('🚀 Starting NexusCart Database Migration...\n');
    
    await migratePlans();
    console.log('');
    
    await migrateCategories();
    console.log('');
    
    await updateProductCounts();
    console.log('');
    
    console.log('✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your application to use the new Firestore collections');
    console.log('2. Deploy the updated Firestore security rules');
    console.log('3. Test the new CRUD APIs');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

export { migratePlans, migrateCategories, updateProductCounts }; 