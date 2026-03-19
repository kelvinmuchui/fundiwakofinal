import { Document } from "mongodb";
import clientPromise from "./mongodb";

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

export async function getCollection<T extends Document = Document>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}
