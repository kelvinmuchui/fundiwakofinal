import { getCollection } from '@/lib/db';

export const CONTACT_ACCESS_FEE = 50;

export async function hasContactAccess(clientId: string, fundiId: string) {
  const transactionsCollection = await getCollection('transactions');
  const transaction = await transactionsCollection.findOne({
    transactionType: 'contact_access',
    clientId,
    fundiId,
    status: 'completed',
    amount: { $gte: CONTACT_ACCESS_FEE },
  });

  return Boolean(transaction);
}
