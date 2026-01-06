// Check userId format in entries
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

async function checkUserIdFormat() {
  try {
    await mongoose.connect(mongoUri);
    
    const db = mongoose.connection.db;
    const entries = await db.collection('entries').find().limit(3).toArray();
    
    console.log('📝 Checking userId format in entries:\n');
    
    for (const entry of entries) {
      console.log(`Entry: ${entry.title}`);
      console.log(`  userId type: ${typeof entry.userId}`);
      console.log(`  userId value: ${entry.userId}`);
      console.log(`  userId instanceof ObjectId: ${entry.userId instanceof mongoose.Types.ObjectId}`);
      console.log('');
    }
    
    // Check users
    const users = await db.collection('users').find().limit(1).toArray();
    console.log('👤 User ID format:\n');
    for (const user of users) {
      console.log(`User: ${user.username}`);
      console.log(`  _id type: ${typeof user._id}`);
      console.log(`  _id value: ${user._id}`);
      console.log(`  _id instanceof ObjectId: ${user._id instanceof mongoose.Types.ObjectId}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUserIdFormat();

