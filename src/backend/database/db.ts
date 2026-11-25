import mongoose from 'mongoose';
import '@/backend/models/User';
import '@/backend/models/Room';
import '@/backend/models/RoomBooking';
import '@/backend/models/Laptop';
import '@/backend/models/LaptopLoan';
import '@/backend/models/Setting';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library-booking';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn && mongoose.connection.readyState === 1) {
    return cached!.conn;
  }

  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached!.conn = null;
    cached!.promise = null;
  }

  if (!cached!.promise) {
    const isLocalhost = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: isLocalhost ? 1500 : 8000,
    };

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e: any) {
    cached!.promise = null;
    const isLocalhost = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1');
    if (isLocalhost && (e.message?.includes('ECONNREFUSED') || e.name === 'MongooseServerSelectionError')) {
      throw new Error(
        'Database connection failed: MongoDB is not running on localhost:27017. Please start your local MongoDB service, or paste your MongoDB Atlas connection string in .env.local (MONGODB_URI=mongodb+srv://...).'
      );
    }
    throw e;
  }

  return cached!.conn;
}

export default connectToDatabase;
