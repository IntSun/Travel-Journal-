// Quick test script to verify MongoDB connection and create a test user
// Run with: node test-setup.js

import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Entry Schema
const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);
const Entry = mongoose.model("Entry", entrySchema);

async function testSetup() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully!\n');

    // Check existing users
    const userCount = await User.countDocuments();
    const entryCount = await Entry.countDocuments();
    
    console.log('📊 Current Database Stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Entries: ${entryCount}\n`);

    // Create a test user if none exist
    if (userCount === 0) {
      console.log('👤 Creating test user...');
      const testUser = await User.create({
        username: 'traveler',
        password: 'password123', // In production, this should be hashed!
        profileImage: null,
      });
      console.log(`✅ Test user created: ${testUser.username} (ID: ${testUser._id})\n`);
      
      // Create sample entries for the test user
      console.log('📝 Creating sample entries...');
      const sampleEntries = [
        {
          userId: testUser._id,
          title: "Alpine Adventures",
          location: "Swiss Alps, Switzerland",
          coordinates: [46.56, 8.56],
          date: new Date("2023-12-15"),
          description: "The air was crisp, the snow was perfect. We spent three days hiking through the trails, enjoying the breathtaking views of the Matterhorn.",
          images: [],
        },
        {
          userId: testUser._id,
          title: "Tropical Paradise Escape",
          location: "Bali, Indonesia",
          coordinates: [-8.34, 115.09],
          date: new Date("2024-03-10"),
          description: "Bali is truly a magical place. From the vibrant culture in Ubud to the serene beaches of Uluwatu. The sunrise was absolutely worth waking up early for.",
          images: [],
        },
        {
          userId: testUser._id,
          title: "European Coffee Culture",
          location: "Paris, France",
          coordinates: [48.85, 2.35],
          date: new Date("2024-05-22"),
          description: "There's nothing quite like sitting at a sidewalk cafe in Paris, sipping an espresso and watching the world go by. The architecture, the fashion, the history - it's all so inspiring.",
          images: [],
        },
      ];

      await Entry.insertMany(sampleEntries);
      console.log(`✅ Created ${sampleEntries.length} sample entries\n`);
    } else {
      console.log('ℹ️  Users already exist. Skipping test data creation.\n');
    }

    // Display all users
    const users = await User.find().select('-password');
    console.log('👥 Existing Users:');
    users.forEach(user => {
      console.log(`   - ${user.username} (ID: ${user._id})`);
    });
    console.log('');

    console.log('✅ Setup complete!');
    console.log('\n📝 You can now:');
    console.log('   1. Start the app: npm run dev');
    console.log('   2. Login with username: "traveler" and password: "password123"');
    console.log('   3. Or register a new account at /auth\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

testSetup();

