import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL as string;

if (!MONGODB_URL) {
  throw new Error('Please define MONGODB_URL environment variable');
}

// Global cache for mongoose connection (crucial for Next.js)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type
declare global {
  var mongoose: MongooseCache | undefined;
}

// Use global cache to persist across hot reloads
const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToMongoDB = async () => {
  // If we have a cached connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If no promise exists, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    cached.promise = mongoose.connect(MONGODB_URL, opts)
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connection established');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error);
        cached.promise = null; 
        throw error;
      });
  }

  try {
    // Wait for the connection promise
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset on error
    throw error;
  }

  return cached.conn;
};