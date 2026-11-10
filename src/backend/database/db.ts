import mongoose from 'mongoose';

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
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // Fail fast (1.5s) if MongoDB is offline so dev fallback activates immediately
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
