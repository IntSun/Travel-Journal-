// Fix user schema - remove email index
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

async function fixUserSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    const db = mongoose.connection.db;
    
    // Check existing indexes
    console.log('📋 Current indexes on users collection:');
    const indexes = await db.collection('users').indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}:`, JSON.stringify(index.key));
    });
    console.log('');
    
    // Drop email index if it exists
    try {
      await db.collection('users').dropIndex('email_1');
      console.log('✅ Dropped email_1 index\n');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️  email_1 index not found (already removed)\n');
      } else {
        throw error;
      }
    }
    
    // Now try to create johndoe
    const User = mongoose.model("User", new mongoose.Schema({
      username: String,
      password: String,
      profileImage: String,
    }, { timestamps: true }));
    
    let johndoe = await User.findOne({ username: 'johndoe' });
    
    if (johndoe) {
      console.log('✅ User "johndoe" already exists!');
    } else {
      johndoe = await User.create({
        username: 'johndoe',
        password: 'demo123',
        profileImage: null,
      });
      console.log('✅ User "johndoe" created successfully!');
    }
    
    console.log('\n🎯 Login Credentials:');
    console.log('   Username: johndoe');
    console.log('   Password: demo123');
    console.log('   ID:', johndoe._id);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

fixUserSchema();

