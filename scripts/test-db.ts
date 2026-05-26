import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";

import { getMongoUri, isMongoAuthError, mongoConnectionHelp } from "../lib/db/mongo-uri";

async function testDb() {
  const uri = getMongoUri();
  if (!uri) {
    console.error(
      "Missing MongoDB config. Set MONGODB_URI or MONGODB_USER + MONGODB_PASSWORD + MONGODB_HOST in .env.local",
    );
    process.exit(1);
  }

  const safeUri = uri.replace(/:([^@/]+)@/, ":****@");
  console.log("Connecting to:", safeUri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      dbName: process.env.MONGODB_DB_NAME?.trim() || undefined,
    });
    await mongoose.connection.db?.admin().ping();
    console.log("OK — MongoDB connection successful.");
    process.exit(0);
  } catch (err) {
    console.error("FAILED — could not connect to MongoDB.\n");
    if (isMongoAuthError(err)) {
      console.error(mongoConnectionHelp());
    } else {
      console.error(err);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

testDb();
