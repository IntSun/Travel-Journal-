// Check user passwords in MongoDB
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function checkPasswords() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    const users = await User.find();
    
    console.log('👥 USER CREDENTIALS:\n');
    
    for (const user of users) {
      console.log(`📌 Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   ID: ${user._id}\n`);
    }
    
    console.log('✅ Done!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkPasswords();

