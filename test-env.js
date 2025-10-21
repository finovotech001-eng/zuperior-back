// Test script to verify environment configuration
// Run with: node test-env.js

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

console.log('='.repeat(60));
console.log('🔧 ENVIRONMENT CONFIGURATION TEST');
console.log('='.repeat(60));
console.log();

// Check if .env file exists
const envPath = join(__dirname, '.env');
const envExists = existsSync(envPath);

console.log('📁 .env file check:');
console.log(`   Path: ${envPath}`);
console.log(`   Exists: ${envExists ? '✅ YES' : '❌ NO'}`);
console.log();

if (!envExists) {
  console.log('⚠️  WARNING: .env file not found!');
  console.log('   Create a .env file in the zuperior-back directory.');
  console.log('   See SETUP.md for instructions.');
  console.log();
}

// Check environment variables
console.log('🔑 Environment Variables:');
console.log();

const requiredVars = {
  'PORT': process.env.PORT,
  'JWT_SECRET': process.env.JWT_SECRET,
  'DATABASE_URL': process.env.DATABASE_URL,
  'NODE_ENV': process.env.NODE_ENV
};

let hasIssues = false;

for (const [key, value] of Object.entries(requiredVars)) {
  const status = value ? '✅' : '❌';
  const displayValue = value 
    ? (key === 'JWT_SECRET' ? `${value.substring(0, 20)}...` : value)
    : 'NOT SET';
  
  console.log(`   ${status} ${key}: ${displayValue}`);
  
  if (!value) {
    hasIssues = true;
    if (key === 'JWT_SECRET') {
      console.log(`      ⚠️  This is CRITICAL for authentication!`);
    }
  }
}

console.log();

// Test JWT Secret consistency
if (process.env.JWT_SECRET) {
  console.log('🔐 JWT Secret Test:');
  console.log(`   Secret is set: ✅`);
  console.log(`   Length: ${process.env.JWT_SECRET.length} characters`);
  
  if (process.env.JWT_SECRET === 'fallback-secret-key') {
    console.log(`   ⚠️  WARNING: Using default fallback secret!`);
    console.log(`      This should be changed for production.`);
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    console.log(`   ⚠️  WARNING: JWT Secret is short (< 32 chars)`);
    console.log(`      Consider using a longer, more secure secret.`);
  }
  console.log();
}

// Summary
console.log('='.repeat(60));
if (hasIssues) {
  console.log('❌ CONFIGURATION ISSUES DETECTED');
  console.log();
  console.log('To fix:');
  console.log('1. Create a .env file in zuperior-back/');
  console.log('2. Add required variables (see SETUP.md)');
  console.log('3. Restart the backend server');
  console.log();
  console.log('Example .env content:');
  console.log('---');
  console.log('PORT=5000');
  console.log('JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345');
  console.log('DATABASE_URL="file:./dev.db"');
  console.log('NODE_ENV=development');
  console.log('---');
} else {
  console.log('✅ CONFIGURATION LOOKS GOOD!');
  console.log();
  console.log('You can now start the server with: npm run dev');
}
console.log('='.repeat(60));
console.log();

