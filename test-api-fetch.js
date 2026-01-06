// Test API fetch for janedoe's entries
import mongoose from 'mongoose';
import 'dotenv/config';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-journal';

async function testApiFetch() {
  try {
    console.log('🧪 Testing API Fetch Simulation\n');
    
    await mongoose.connect(mongoUri);
    
    // Get janedoe's ID
    const User = mongoose.model("User", new mongoose.Schema({
      username: String,
      password: String,
    }));
    
    const janedoe = await User.findOne({ username: 'janedoe' });
    if (!janedoe) {
      console.log('❌ janedoe user not found');
      return;
    }
    
    console.log(`✅ Found user: janedoe`);
    console.log(`   ID: ${janedoe._id}\n`);
    
    // Test direct query
    const Entry = mongoose.model("Entry", new mongoose.Schema({
      userId: mongoose.Schema.Types.Mixed,
      title: String,
      location: String,
    }));
    
    console.log('Testing direct MongoDB query...');
    const directEntries = await Entry.find({ userId: janedoe._id });
    console.log(`✅ Direct query found: ${directEntries.length} entries\n`);
    
    // Test with string ID
    console.log('Testing with string ID...');
    const stringEntries = await Entry.find({ userId: janedoe._id.toString() });
    console.log(`✅ String ID query found: ${stringEntries.length} entries\n`);
    
    if (directEntries.length > 0) {
      console.log('📝 Sample entries:');
      directEntries.slice(0, 3).forEach((entry, i) => {
        console.log(`   ${i + 1}. ${entry.title} - ${entry.location}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testApiFetch();

