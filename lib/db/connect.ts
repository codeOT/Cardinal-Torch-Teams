import mongoose from "mongoose";

import { getMongoUri } from "@/lib/db/mongo-uri";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function resetCache() {
  cached.conn = null;
  cached.promise = null;
}

export async function connectDB() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error(
      "MongoDB is not configured. Set MONGODB_URI or MONGODB_USER, MONGODB_PASSWORD, and MONGODB_HOST in .env.local",
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const options: mongoose.ConnectOptions = { bufferCommands: false };
    const dbName = process.env.MONGODB_DB_NAME?.trim();
    if (dbName) {
      options.dbName = dbName;
    }

    cached.promise = mongoose.connect(uri, options).catch((err) => {
      resetCache();
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    resetCache();
    throw err;
  }
}
