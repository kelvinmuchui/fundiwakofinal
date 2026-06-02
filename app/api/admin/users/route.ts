import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersCollection = await getCollection<User>('users');
    const users = await usersCollection.find({}, {
      projection: {
        password: 0 // Exclude password from response
      }
    }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    if (!session || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, role } = body;

    // Validate required fields
    if (!name || !email || !phone || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate role
    if (!['admin', 'fundi', 'client'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const usersCollection = await getCollection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create new user
    const newUser = {
      name,
      email,
      phone,
      role,
      password: hashedPassword,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as any);

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