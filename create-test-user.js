// Create a test user with plain text password for easy testing
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    // Check if janedoe exists
    let janedoe = await User.findOne({ username: 'janedoe' });
    
    if (janedoe) {
      console.log('📝 Updating janedoe password to: demo123\n');
      janedoe.password = 'demo123';
      await janedoe.save();
      console.log('✅ Password updated successfully!\n');
    } else {
      console.log('📝 Creating janedoe user...\n');
      janedoe = await User.create({
        username: 'janedoe',
        password: 'demo123',
        profileImage: null,
      });
      console.log('✅ User created successfully!\n');
    }
    
    console.log('🎯 Login Credentials:');
    console.log('   Username: janedoe');
    console.log('   Password: demo123\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

createTestUser();

