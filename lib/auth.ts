import { getServerSession } from 'next-auth/next';

// Helper to get server-side session in API routes
export async function getAuthSession() {
  return await getServerSession();
}