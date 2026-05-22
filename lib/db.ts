import { Document } from "mongodb";
import clientPromise from "./mongodb";

export async function getDb() {
  try {
    const client = await clientPromise;
    return client.db();
  } catch (error) {
    console.error('Failed to get database:', error);
    throw new Error('Database connection failed');
  }
}

export async function getCollection<T extends Document = Document>(name: string) {
  try {
    const db = await getDb();
    return db.collection<T>(name);
  } catch (error) {
    console.error(`Failed to get collection '${name}':`, error);
    throw new Error(`Database collection '${name}' unavailable`);
  }
}

// Utility function to check database health
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy', message: string }> {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    return { status: 'healthy', message: 'Database connection is healthy' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Database health check failed:', message);
    return { status: 'unhealthy', message };
  }
}
