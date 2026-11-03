import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getCollection<User>('users');
    const users = await usersCollection.find({}, {
      projection: {
        password: 0,
        verificationToken: 0,
        verificationTokenExpires: 0,
        resetToken: 0,
        resetTokenExpires: 0,
        bankAccountNumberEncrypted: 0,
        bankAccountNameEncrypted: 0,
        mpesaNumberEncrypted: 0,
        idNumberEncrypted: 0,
        phoneEncrypted: 0,
        connections: 0,
        connectionRequests: 0,
        blocked: 0,
        profileViews: 0,
        notifications: 0,
        certificates: 0,
        showcasePhotos: 0,
      }
    }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(users, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string } | undefined)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const { name, email, phone, role } = body as Record<string, unknown>;

    // Validate required fields
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof phone !== 'string' || !phone.trim() ||
      typeof role !== 'string'
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    if (role !== 'admin' && role !== 'fundi' && role !== 'client') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const usersCollection = await getCollection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new user
    const newUser: Omit<User, '_id'> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      password: hashedPassword,
      idNumber: '',
      isVerified: false,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      _id: result.insertedId,
      ...newUser,
      password: undefined, // Don't return password
      tempPassword: tempPassword, // Send temp password back
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}