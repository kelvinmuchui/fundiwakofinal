import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri && process.env.NODE_ENV === "production") {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function connectWithRetry(uri: string, retries = MAX_RETRIES): Promise<MongoClient> {
  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('Successfully connected to MongoDB');
    return client;
  } catch (error) {
    console.error(`MongoDB connection attempt failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error);

    if (retries > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(uri, retries - 1);
    }

    throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable so the client is cached across module reloads.
  // @ts-ignore
  if (!global._mongoClientPromise) {
    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
    // @ts-ignore
    global._mongoClientPromise = connectWithRetry(uri);
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  clientPromise = connectWithRetry(uri);
}

export default clientPromise;
