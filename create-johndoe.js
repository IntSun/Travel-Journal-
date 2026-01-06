// Create johndoe user
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createJohnDoe() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    // Check if johndoe already exists
    let johndoe = await User.findOne({ username: 'johndoe' });
    
    if (johndoe) {
      console.log('✅ User "johndoe" already exists!\n');
      console.log('🎯 Login Credentials:');
      console.log('   Username: johndoe');
      console.log('   Password:', johndoe.password);
    } else {
      console.log('📝 Creating johndoe user...\n');
      johndoe = await User.create({
        username: 'johndoe',
        password: 'demo123',
        profileImage: null,
      });
      console.log('✅ User created successfully!\n');
      console.log('🎯 Login Credentials:');
      console.log('   Username: johndoe');
      console.log('   Password: demo123');
    }
    
    console.log('   ID:', johndoe._id);
    console.log('\n💡 You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

createJohnDoe();

