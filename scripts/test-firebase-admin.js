#!/usr/bin/env node

require('dotenv').config();

console.log('🔧 Testing Firebase Admin SDK Configuration');
console.log('==========================================\n');

// Check environment variables
console.log('Environment Variables Check:');
console.log('============================');

const requiredVars = [
  'FIREBASE_ADMIN_SDK_JSON',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY'
];

let hasAdminConfig = false;

for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 50)}...`);
    hasAdminConfig = true;
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
}

console.log('\n');

if (!hasAdminConfig) {
  console.log('❌ No Firebase Admin SDK configuration found!');
  console.log('📝 Please add one of the following to your .env file:');
  console.log('');
  console.log('Option 1 (Recommended):');
  console.log('FIREBASE_ADMIN_SDK_JSON={"type":"service_account",...}');
  console.log('');
  console.log('Option 2:');
  console.log('FIREBASE_ADMIN_PROJECT_ID=your_project_id');
  console.log('FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com');
  console.log('FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  console.log('');
  process.exit(1);
}

// Try to initialize Firebase Admin
try {
  console.log('🚀 Testing Firebase Admin SDK initialization...');
  
  const admin = require('firebase-admin');
  
  // Check if already initialized
  if (admin.apps.length > 0) {
    console.log('✅ Firebase Admin SDK already initialized');
  } else {
    console.log('🔄 Initializing Firebase Admin SDK...');
    
    // Try to initialize with the available config
    if (process.env.FIREBASE_ADMIN_SDK_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized with JSON config');
    } else if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      };
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin SDK initialized with individual variables');
    }
  }
  
  // Test Firestore connection
  console.log('🔍 Testing Firestore connection...');
  const db = admin.firestore();
  console.log('✅ Firestore connection successful');
  
  console.log('\n🎉 Firebase Admin SDK is properly configured!');
  console.log('✅ You can now run the migration script');
  
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:');
  console.error(error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Check that your service account JSON is valid');
  console.log('2. Ensure the private key is properly formatted');
  console.log('3. Verify the project ID matches your Firebase project');
  console.log('4. Make sure the service account has the necessary permissions');
  process.exit(1);
} 