// Simple MongoDB connection test script
// Run with: node test-mongodb.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env file');
  console.log('\nPlease create a .env file with:');
  console.log('MONGODB_URI=mongodb://localhost:27017/travel-journal');
  process.exit(1);
}

console.log('🔄 Testing MongoDB connection...');
console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

try {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ MongoDB connection successful!');
  
  // Test database operations
  console.log('\n📊 Database Info:');
  console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  console.log(`   Host: ${mongoose.connection.host}`);
  console.log(`   Port: ${mongoose.connection.port}`);
  
  // List collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\n📁 Collections (${collections.length}):`);
  if (collections.length === 0) {
    console.log('   (No collections yet - they will be created when you add data)');
  } else {
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
  }
  
  console.log('\n✨ Everything looks good! You can now run: npm run dev');
  
} catch (error) {
  console.error('\n❌ MongoDB connection failed!');
  console.error(`   Error: ${error.message}`);
  
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Is MongoDB running?');
  console.log('      - Local: Run "mongosh" to check');
  console.log('      - Atlas: Check your connection string');
  console.log('   2. Is the connection string correct in .env?');
  console.log('   3. For Atlas: Is your IP whitelisted?');
  
  process.exit(1);
} finally {
  await mongoose.connection.close();
}

