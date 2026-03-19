import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/db';
import type { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    let body: any;
    const contentType = request.headers.get('content-type');

    // Handle both JSON and FormData requests
    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        idNumber: formData.get('idNumber'),
        email: formData.get('email'),
        password: formData.get('password'),
        skill: formData.get('skill'),
        experience: formData.get('experience'),
        tvetInstitution: formData.get('tvetInstitution'),
        description: formData.get('description'),
        location: formData.get('location'),
        neighborhood: formData.get('neighborhood'),
        businessName: formData.get('businessName'),
        businessRegistration: formData.get('businessRegistration'),
        mpesaNumber: formData.get('mpesaNumber'),
        bankName: formData.get('bankName'),
        bankAccountName: formData.get('bankAccountName'),
        bankAccountNumber: formData.get('bankAccountNumber'),
        reasonForJoining: formData.get('reasonForJoining'),
        availability: formData.get('availability'),
        role: formData.get('role'),
        certificates: formData.getAll('certificates'),
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Extract required fields
    const { name, phone, idNumber, email, password, role } = body;

    const requiredFields: Record<string, any> = { name, phone, idNumber, email, password, role };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (typeof value !== 'string' || value.trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +254XXXXXXXXX or 07XXXXXXXX' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['client', 'fundi', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists (only include non-empty fields)
    const existingQuery: Record<string, string>[] = [];
    if (email) existingQuery.push({ email });
    if (phone) existingQuery.push({ phone });
    if (idNumber) existingQuery.push({ idNumber });

    const usersCollection = await getCollection<User>('users');
    let existingUser = null;

    if (existingQuery.length > 0) {
      existingUser = await usersCollection.findOne({ $or: existingQuery });
    }

    if (existingUser) {
      const conflictField =
        existingUser.email === email
          ? 'email'
          : existingUser.phone === phone
          ? 'phone'
          : existingUser.idNumber === idNumber
          ? 'id number'
          : 'credentials';

      return NextResponse.json(
        { error: `User with this ${conflictField} already exists` },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle certificate uploads (simplified - in production, upload to cloud storage)
    const certificates: string[] = [];
    if (body.certificates && Array.isArray(body.certificates)) {
      for (const file of body.certificates) {
        if (file instanceof File && file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Certificate file size must be less than 5MB' },
            { status: 400 }
          );
        }
        if (file instanceof File) {
          certificates.push(file.name);
        }
      }
    }

    // Create user with role-specific data
    const baseUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      idNumber,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let newUser: Omit<User, '_id'>;

    if (role === 'fundi') {
      // Fundi-specific fields
      const requiredFundiFields = { skill: body.skill, experience: body.experience, description: body.description, location: body.location, neighborhood: body.neighborhood };
      for (const [field, value] of Object.entries(requiredFundiFields)) {
        if (!value) {
          return NextResponse.json(
            { error: `${field} is required for Fundi registration` },
            { status: 400 }
          );
        }
      }

      newUser = {
        ...baseUser,
        skill: body.skill,
        experience: body.experience,
        tvetInstitution: body.tvetInstitution || undefined,
        description: body.description,
        location: body.location,
        neighborhood: body.neighborhood,
        businessName: body.businessName || undefined,
        businessRegistration: body.businessRegistration || undefined,
        mpesaNumber: body.mpesaNumber || undefined,
        bankName: body.bankName || undefined,
        bankAccountName: body.bankAccountName || undefined,
        bankAccountNumber: body.bankAccountNumber || undefined,
        availability: body.availability || 'flexible',
        reasonForJoining: body.reasonForJoining || undefined,
        certificates: certificates.length > 0 ? certificates : undefined,
      };
    } else {
      // Client or Admin
      newUser = baseUser as any;
    }

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      message: 'Account created successfully',
      userId: result.insertedId,
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Handle MongoDB connection errors
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('MongoNetworkError') || errorMessage.includes('connect')) {
      console.error('MongoDB connection failed:', errorMessage);
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}