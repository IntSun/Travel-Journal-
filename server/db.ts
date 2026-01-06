import mongoose from "mongoose";

let isConnected = false;

function log(message: string, source = "database") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function connectDB() {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error("MONGODB_URI not found in environment variables");
    console.error("Available env vars:", Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('NODE')));
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  try {
    log("Attempting to connect to MongoDB...", "database");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    log("MongoDB connected successfully", "database");
  } catch (error: any) {
    log(`MongoDB connection error: ${error.message}`, "database");
    console.error("Full error:", error);
    isConnected = false;
    throw error;
  }
}

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

// Journal Entry Schema
const entrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Support both String and ObjectId
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
    type: [Number], // [latitude, longitude]
    required: true,
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && 
               v[0] >= -90 && v[0] <= 90 && 
               v[1] >= -180 && v[1] <= 180;
      },
      message: "Coordinates must be [latitude, longitude] with valid ranges"
    }
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
    validate: {
      validator: function(v: string[]) {
        return v.length <= 3;
      },
      message: "Maximum 3 images allowed per entry"
    }
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
entrySchema.index({ userId: 1, createdAt: -1 });
entrySchema.index({ title: "text", location: "text", description: "text" });

export const User = mongoose.model("User", userSchema);
// Use explicit collection name to match existing data
export const Entry = mongoose.model("Entry", entrySchema, "travelentries");

