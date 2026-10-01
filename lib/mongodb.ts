import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === "production") {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let clientPromise: Promise<MongoClient>;

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const mongoGlobal = globalThis as MongoGlobal;

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

async function connectWithRetry(uri: string, attempt = 1): Promise<MongoClient> {
  let client: MongoClient | undefined;
  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('Successfully connected to MongoDB');
    return client;
  } catch (error) {
    await client?.close().catch(() => undefined);
    console.error(`MongoDB connection attempt failed (${attempt}/${MAX_ATTEMPTS}):`, error);

    if (attempt < MAX_ATTEMPTS) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(uri, attempt + 1);
    }

    throw new Error(`Failed to connect to MongoDB after ${MAX_ATTEMPTS} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

if (process.env.NODE_ENV === "development") {
  // Cache successful connections across development reloads, but never cache a rejection.
  if (!mongoGlobal._mongoClientPromise) {
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
    mongoGlobal._mongoClientPromise = connectWithRetry(uri).catch((error) => {
      mongoGlobal._mongoClientPromise = undefined;
      throw error;
    });
  }
  clientPromise = mongoGlobal._mongoClientPromise;
} else {
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  clientPromise = connectWithRetry(uri);
}

export default clientPromise;
