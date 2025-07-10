#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 NexusCart Environment Setup Helper');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  console.log('📝 You can edit it manually or run this script to see the required variables\n');
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env file with template...\n');
}

// Create template .env content
const envTemplate = `# NexusCart Environment Variables
# Copy your Firebase configuration values below

# ----------------------------------------------------------------------------------
# Firebase Client SDK (Required for client-side Auth & DB)
# ----------------------------------------------------------------------------------
# To get these values:
# 1. Go to your Firebase Console (https://console.firebase.google.com/).
# 2. Click the Gear icon > Project settings.
# 3. In the "General" tab, scroll down to the "Your apps" section.
# 4. Find your Web App and click on the "SDK setup and configuration" button.
# 5. Select "Config" and copy the values into the variables below.
# ----------------------------------------------------------------------------------
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ----------------------------------------------------------------------------------
# Firebase Admin SDK (Required for server-side session management & migration)
# ----------------------------------------------------------------------------------
# To get this:
# 1. Go to your Firebase Console > Project Settings > Service accounts tab.
# 2. Click "Generate new private key" and download the JSON file.
# 3. Open the file, copy its ENTIRE contents, and paste it here as a SINGLE-LINE string.
#    (You may need to use an online tool to convert the JSON to a single line).
# ----------------------------------------------------------------------------------
FIREBASE_ADMIN_SDK_JSON=

# Alternative method using individual environment variables:
# FIREBASE_ADMIN_PROJECT_ID=
# FIREBASE_ADMIN_CLIENT_EMAIL=
# FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"

# ----------------------------------------------------------------------------------
# Google Cloud Storage (Required for real image uploads)
# ----------------------------------------------------------------------------------
# These values are found in the same JSON key file from the step above.
# ----------------------------------------------------------------------------------
GCS_PROJECT_ID=
GCS_BUCKET_NAME=
# The full JSON key file content as a single-line string (can be the same as FIREBASE_ADMIN_SDK_JSON)
GOOGLE_APPLICATION_CREDENTIALS_JSON=

# ----------------------------------------------------------------------------------
# Payment Gateway Credentials (Optional)
# ----------------------------------------------------------------------------------
# Khalti credentials (optional - for payment processing)
# KHALTI_SECRET_KEY=
# KHALTI_PUBLIC_KEY=

# eSewa credentials (optional - for payment processing)
# ESEWA_MERCHANT_CODE=
# ESEWA_SECRET_KEY=

# ----------------------------------------------------------------------------------
# AI & Notifications (Optional)
# ----------------------------------------------------------------------------------
# Google AI API Key for Genkit
# GOOGLE_AI_API_KEY=

# Twilio credentials (optional - for WhatsApp notifications)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
`;

if (!envExists) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file with template');
  console.log('📝 Please edit the .env file and add your Firebase credentials\n');
}

console.log('🔑 Required Environment Variables:');
console.log('==================================');
console.log('');
console.log('1. NEXT_PUBLIC_FIREBASE_* - Firebase Client SDK configuration');
console.log('2. FIREBASE_ADMIN_SDK_JSON - Firebase Admin SDK (for migration)');
console.log('');
console.log('📖 For detailed instructions, see: MIGRATION_SETUP.md');
console.log('');
console.log('🚀 After setting up environment variables, run:');
console.log('   npm run migrate-categories-plans');
console.log('');
console.log('🔒 Then deploy Firestore rules:');
console.log('   firebase deploy --only firestore:rules'); 