import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/db';
import type { User } from '@/lib/models/User';
import { getPhoneNumberPattern, kenyanPhoneSchema } from '@/lib/validation';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or phone number', type: 'text' },
        email: { label: 'Email or phone number', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier || credentials?.email;
        if (!identifier || !credentials?.password) {
          return null;
        }

        try {
          const usersCollection = await getCollection<User>('users');
          const user = identifier.includes('@')
            ? await usersCollection.findOne({
                email: { $regex: `^${escapeRegExp(identifier.trim())}$`, $options: 'i' },
              })
            : await findUserByPhone(usersCollection, identifier);

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

async function findUserByPhone(usersCollection: Awaited<ReturnType<typeof getCollection<User>>>, phone: string) {
  const parsedPhone = kenyanPhoneSchema.safeParse(phone);
  if (!parsedPhone.success) {
    return null;
  }
  return usersCollection.findOne({ phone: { $regex: getPhoneNumberPattern(parsedPhone.data) } });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}