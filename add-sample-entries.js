// Add sample entries for janedoe user
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

async function addSampleEntries() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    // Find janedoe user
    const janedoe = await User.findOne({ username: 'janedoe' });
    
    if (!janedoe) {
      console.log('❌ User "janedoe" not found!');
      console.log('   Please register this user first.\n');
      return;
    }
    
    console.log(`✅ Found user: ${janedoe.username} (ID: ${janedoe._id})\n`);
    
    // Check if entries already exist
    const existingEntries = await Entry.countDocuments({ userId: janedoe._id });
    if (existingEntries > 0) {
      console.log(`ℹ️  User already has ${existingEntries} entries.`);
      console.log('   Skipping to avoid duplicates.\n');
      return;
    }
    
    console.log('📝 Creating sample entries...\n');
    
    // Sample entries with beautiful descriptions
    const sampleEntries = [
      {
        userId: janedoe._id,
        title: "Alpine Adventures",
        location: "Swiss Alps, Switzerland",
        coordinates: [46.56, 8.56],
        date: new Date("2023-12-15"),
        description: "The air was crisp, the snow was perfect. We spent three days hiking through the trails, enjoying the breathtaking views of the Matterhorn. The fondue at the local chalet was the perfect way to end each day. Every morning, we woke up to the sound of cowbells and the sight of snow-capped peaks glistening in the sunrise.",
        images: [],
        createdAt: new Date("2023-12-15"),
        updatedAt: new Date("2023-12-15"),
      },
      {
        userId: janedoe._id,
        title: "Tropical Paradise Escape",
        location: "Bali, Indonesia",
        coordinates: [-8.34, 115.09],
        date: new Date("2024-03-10"),
        description: "Bali is truly a magical place. From the vibrant culture in Ubud to the serene beaches of Uluwatu. We woke up early to catch the sunrise and it was absolutely worth it. The colors of the sky were unlike anything I've ever seen. The local temples, the rice terraces, and the warm hospitality of the Balinese people made this trip unforgettable.",
        images: [],
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-10"),
      },
      {
        userId: janedoe._id,
        title: "European Coffee Culture",
        location: "Paris, France",
        coordinates: [48.85, 2.35],
        date: new Date("2024-05-22"),
        description: "There's nothing quite like sitting at a sidewalk cafe in Paris, sipping an espresso and watching the world go by. The architecture, the fashion, the history - it's all so inspiring. We visited the Louvre and got lost in the Marais. Every corner revealed a new bakery, a hidden bookshop, or a charming bistro. The Eiffel Tower at night was pure magic.",
        images: [],
        createdAt: new Date("2024-05-22"),
        updatedAt: new Date("2024-05-22"),
      },
      {
        userId: janedoe._id,
        title: "Hidden Gems of Kyoto",
        location: "Kyoto, Japan",
        coordinates: [35.01, 135.76],
        date: new Date("2024-11-05"),
        description: "Kyoto in autumn is spectacular. The red maples against the traditional temples create a scene straight out of a painting. We found a small ramen shop tucked away in an alley that served the best broth I've ever tasted. The bamboo groves of Arashiyama, the golden pavilion, and the peaceful zen gardens made this journey deeply spiritual and memorable.",
        images: [],
        createdAt: new Date("2024-11-05"),
        updatedAt: new Date("2024-11-05"),
      },
      {
        userId: janedoe._id,
        title: "Santorini Sunsets",
        location: "Santorini, Greece",
        coordinates: [36.39, 25.46],
        date: new Date("2024-08-18"),
        description: "The white-washed buildings against the deep blue Aegean Sea create the most stunning contrast. Every evening, we gathered in Oia to watch the famous sunset, and each one was more beautiful than the last. The local wine, fresh seafood, and warm Greek hospitality made us feel right at home. Swimming in the volcanic hot springs was an experience I'll never forget.",
        images: [],
        createdAt: new Date("2024-08-18"),
        updatedAt: new Date("2024-08-18"),
      },
      {
        userId: janedoe._id,
        title: "Northern Lights in Iceland",
        location: "Reykjavik, Iceland",
        coordinates: [64.13, -21.94],
        date: new Date("2024-02-14"),
        description: "Witnessing the Aurora Borealis dance across the Arctic sky was a bucket list moment. The green and purple lights swirled above us as we soaked in the Blue Lagoon. Iceland's dramatic landscapes - from black sand beaches to massive waterfalls and geothermal areas - felt like another planet. The midnight sun and the kindness of locals made this winter adventure truly special.",
        images: [],
        createdAt: new Date("2024-02-14"),
        updatedAt: new Date("2024-02-14"),
      },
    ];
    
    // Insert entries
    const result = await Entry.insertMany(sampleEntries);
    
    console.log(`✅ Successfully created ${result.length} entries for ${janedoe.username}!\n`);
    
    // Display created entries
    console.log('📍 Created Entries:');
    result.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.title}`);
      console.log(`      📍 ${entry.location}`);
      console.log(`      📅 ${new Date(entry.date).toLocaleDateString()}`);
    });
    
    console.log('\n✅ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Login as "janedoe"');
    console.log('   2. View entries on the home page');
    console.log('   3. See them plotted on the map');
    console.log('   4. Click any entry to view details\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

addSampleEntries();

