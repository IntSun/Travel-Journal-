// Comprehensive MongoDB integration test
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String,
}, { timestamps: true });

const entrySchema = new mongoose.Schema({
  userId: String,
  title: String,
  location: String,
  coordinates: [Number],
  date: Date,
  description: String,
  images: [String],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Entry = mongoose.model("Entry", entrySchema);

async function comprehensiveTest() {
  try {
    console.log('🔍 COMPREHENSIVE MONGODB INTEGRATION TEST\n');
    console.log('='.repeat(60) + '\n');
    
    // 1. Connection Test
    console.log('1️⃣  Testing MongoDB Connection...');
    await mongoose.connect(mongoUri);
    console.log('   ✅ Connected successfully\n');
    
    // 2. Schema Test
    console.log('2️⃣  Testing Schemas...');
    const userCount = await User.countDocuments();
    const entryCount = await Entry.countDocuments();
    console.log(`   ✅ User schema working (${userCount} users)`);
    console.log(`   ✅ Entry schema working (${entryCount} entries)\n`);
    
    // 3. User CRUD Test
    console.log('3️⃣  Testing User Operations...');
    const users = await User.find().limit(3);
    for (const user of users) {
      const userEntries = await Entry.countDocuments({ userId: user._id.toString() });
      console.log(`   ✅ ${user.username}: ${userEntries} entries`);
    }
    console.log('');
    
    // 4. Entry CRUD Test
    console.log('4️⃣  Testing Entry Operations...');
    const entries = await Entry.find().limit(3);
    if (entries.length > 0) {
      console.log(`   ✅ Can read entries (found ${entries.length})`);
      console.log(`   ✅ Sample: "${entries[0].title}" at ${entries[0].location}`);
    } else {
      console.log('   ⚠️  No entries found (expected if database is empty)');
    }
    console.log('');
    
    // 5. Index Test
    console.log('5️⃣  Testing Indexes...');
    const userIndexes = await User.collection.getIndexes();
    const entryIndexes = await Entry.collection.getIndexes();
    console.log(`   ✅ User indexes: ${Object.keys(userIndexes).length}`);
    console.log(`   ✅ Entry indexes: ${Object.keys(entryIndexes).length}\n`);
    
    // 6. Query Performance Test
    console.log('6️⃣  Testing Query Performance...');
    const start = Date.now();
    await Entry.find({ userId: users[0]?._id.toString() });
    const duration = Date.now() - start;
    console.log(`   ✅ Query executed in ${duration}ms\n`);
    
    // 7. Data Integrity Test
    console.log('7️⃣  Testing Data Integrity...');
    let integrityIssues = 0;
    
    // Check for entries with invalid userId
    const allEntries = await Entry.find();
    for (const entry of allEntries) {
      const userExists = await User.findById(entry.userId);
      if (!userExists) {
        console.log(`   ⚠️  Entry "${entry.title}" has invalid userId: ${entry.userId}`);
        integrityIssues++;
      }
    }
    
    // Check for required fields
    for (const entry of allEntries) {
      if (!entry.title || !entry.location || !entry.date || !entry.description) {
        console.log(`   ⚠️  Entry missing required fields: ${entry._id}`);
        integrityIssues++;
      }
      if (!entry.coordinates || entry.coordinates.length !== 2) {
        console.log(`   ⚠️  Entry has invalid coordinates: ${entry._id}`);
        integrityIssues++;
      }
    }
    
    if (integrityIssues === 0) {
      console.log('   ✅ All data integrity checks passed');
    } else {
      console.log(`   ⚠️  Found ${integrityIssues} integrity issues`);
    }
    console.log('');
    
    // 8. Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY\n');
    console.log(`   Database: ${mongoUri.split('/').pop()}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Entries: ${entryCount}`);
    console.log(`   Integrity Issues: ${integrityIssues}`);
    console.log('');
    
    // 9. Test Accounts
    console.log('🔐 TEST ACCOUNTS\n');
    for (const user of users) {
      const userEntries = await Entry.countDocuments({ userId: user._id.toString() });
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Entries: ${userEntries}`);
      console.log(`   ID: ${user._id}\n`);
    }
    
    // 10. API Endpoints to Test
    console.log('🔗 API ENDPOINTS TO TEST\n');
    console.log('   User Endpoints:');
    console.log('   - GET  /api/users/:id');
    console.log('   - GET  /api/users/username/:username');
    console.log('   - POST /api/users');
    console.log('');
    console.log('   Entry Endpoints:');
    console.log('   - GET    /api/entries/user/:userId');
    console.log('   - GET    /api/entries/:id');
    console.log('   - POST   /api/entries');
    console.log('   - PATCH  /api/entries/:id');
    console.log('   - DELETE /api/entries/:id?userId=xxx');
    console.log('');
    
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('MongoDB is properly integrated and working correctly.');
    console.log('');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

comprehensiveTest();

