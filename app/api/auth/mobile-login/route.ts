import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection } from '@/lib/db';
import { getPhoneNumberPattern, kenyanPhoneSchema } from '@/lib/validation';
import type { User } from '@/lib/models/User';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-jwt';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Email or phone number and password are required' }, { status: 400 });
    }

    const { identifier, email, phone, password } = body as {
      identifier?: unknown;
      email?: unknown;
      phone?: unknown;
      password?: unknown;
    };
    const loginIdentifier = identifier || email || phone;

    if (typeof loginIdentifier !== 'string' || typeof password !== 'string' || !loginIdentifier || !password) {
      return NextResponse.json({ error: 'Email or phone number and password are required' }, { status: 400 });
    }

    const usersCollection = await getCollection<User>('users');
    let user;
    if (loginIdentifier.includes('@')) {
      const escapedEmail = loginIdentifier.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      user = await usersCollection.findOne({
        email: { $regex: `^${escapedEmail}$`, $options: 'i' },
      });
    } else {
      const parsedPhone = kenyanPhoneSchema.safeParse(loginIdentifier);
      if (!parsedPhone.success) {
        return NextResponse.json({ error: 'Enter a valid email address or Kenyan phone number' }, { status: 400 });
      }
      user = await usersCollection.findOne({
        phone: { $regex: getPhoneNumberPattern(parsedPhone.data) },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token for mobile app
    const token = jwt.sign(
      { 
        id: user._id!.toString(),
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '30d' } // Long lived token for mobile
    );

    // Return user info and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
