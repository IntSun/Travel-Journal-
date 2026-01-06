// Check all data in MongoDB
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  profileImage: String,
}, { timestamps: true });

const entrySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  location: String,
  coordinates: [Number],
  date: Date,
  description: String,
  images: [String],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Entry = mongoose.model("Entry", entrySchema);

async function checkData() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    // Get all users
    const users = await User.find().select('-password');
    console.log('👥 USERS IN DATABASE:');
    console.log(`   Total: ${users.length}\n`);
    
    for (const user of users) {
      const entryCount = await Entry.countDocuments({ userId: user._id });
      console.log(`   📌 ${user.username}`);
      console.log(`      ID: ${user._id}`);
      console.log(`      Entries: ${entryCount}`);
      console.log(`      Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}\n`);
    }
    
    // Get all entries
    const entries = await Entry.find().populate('userId', 'username');
    console.log('📝 ENTRIES IN DATABASE:');
    console.log(`   Total: ${entries.length}\n`);
    
    if (entries.length > 0) {
      for (const entry of entries) {
        console.log(`   ✈️  ${entry.title}`);
        console.log(`      Location: ${entry.location}`);
        console.log(`      User: ${entry.userId?.username || 'Unknown'}`);
        console.log(`      Date: ${new Date(entry.date).toLocaleDateString()}`);
        console.log(`      Images: ${entry.images?.length || 0}\n`);
      }
    } else {
      console.log('   No entries found. Users need to create journal entries!\n');
    }
    
    console.log('✅ Database check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkData();

