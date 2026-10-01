import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCollection } from '@/lib/db';
import type { User } from '@/lib/models/User';
import { registerSchema, getValidationErrorMessages } from '@/lib/validation';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/emailService';
import { logAuditAction, logComplianceAction } from '@/lib/auditLog';

type RegistrationBody = {
  name: string;
  email: string;
  password: string;
  role: string;
  acceptTerms: boolean;
  phone: string;
  skill: string;
  experience: string;
  description: string;
  location: string;
  neighborhood: string;
  tvetInstitution: string;
  reasonForJoining: string;
  availability: string;
  idNumber: string;
  skills: string[];
  hourlyRate: string;
  yearsOfExperience: number;
};

export async function POST(request: NextRequest) {
  try {
    let body: RegistrationBody;
    const contentType = request.headers.get('content-type');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Handle both JSON and FormData requests
    if (contentType?.includes('application/json')) {
      body = await request.json() as RegistrationBody;
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const getValue = (key: string) => formData.get(key)?.toString() || '';
      body = {
        name: getValue('name'),
        email: getValue('email'),
        password: getValue('password'),
        role: getValue('role'),
        acceptTerms: getValue('acceptTerms') === 'true',
        // Fundi-specific fields
        phone: getValue('phone'),
        skill: getValue('skill'),
        experience: getValue('experience'),
        description: getValue('description'),
        location: getValue('location'),
        neighborhood: getValue('neighborhood'),
        tvetInstitution: getValue('tvetInstitution'),
        reasonForJoining: getValue('reasonForJoining'),
        availability: getValue('availability') || 'flexible',
        idNumber: getValue('idNumber'),
        skills: formData.getAll('skills').map((skill) => skill.toString()),
        hourlyRate: getValue('hourlyRate'),
        yearsOfExperience: parseInt(getValue('yearsOfExperience') || '0'),
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Validate input with Zod schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors = getValidationErrorMessages(validation.error);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { email, password, name, role, acceptTerms } = validation.data;

    // Check if user already exists
    const usersCollection = await getCollection<User>('users');
    const existingUser = await usersCollection.findOne({ 
      $or: [
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      await logAuditAction('register', 'unknown', {
        status: 'failure',
        statusCode: 400,
        errorMessage: 'User already exists',
        metadata: { email, role, ipAddress }
      });

      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate email verification token
    const { token: verificationToken, expiresAt: verificationTokenExpires } = generateVerificationToken();

    // Create base user object
    const baseUser: Omit<User, '_id'> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      idNumber: '',
      isVerified: false,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
      phone: body.phone || '',
      neighborhood: body.neighborhood || '',
    };

    let newUser: Omit<User, '_id'> = baseUser;

    // Add role-specific fields
    if (role === 'fundi') {
      newUser = {
        ...baseUser,
        skill: body.skill,
        experience: body.experience,
        description: body.description,
        location: body.location,
        tvetInstitution: body.tvetInstitution,
        neighborhood: body.neighborhood,
        reasonForJoining: body.reasonForJoining,
        skills: body.skills || [],
        idNumber: body.idNumber || '',
        hourlyRate: body.hourlyRate || '0',
        availability: ['flexible', 'fulltime', 'parttime', 'weekends'].includes(body.availability) ? body.availability as 'flexible' | 'fulltime' | 'parttime' | 'weekends' : 'flexible',
      };
    }

    // Insert user into database
    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // Keep the account and its review application in sync before external side effects.
    if (role === 'fundi') {
      try {
        const applicationsCollection = await getCollection('worker_applications');
        await applicationsCollection.insertOne({
          userId,
          name,
          email: email.toLowerCase(),
          phone: body.phone || '',
          skill: body.skill,
          experience: body.experience,
          description: body.description,
          location: body.location,
          tvetInstitution: body.tvetInstitution,
          neighborhood: body.neighborhood,
          reasonForJoining: body.reasonForJoining,
          skills: body.skills || [],
          yearsOfExperience: body.yearsOfExperience,
          status: 'pending',
          createdAt: new Date(),
          submittedAt: new Date(),
        });
      } catch (applicationError) {
        try {
          await usersCollection.deleteOne({ _id: result.insertedId });
        } catch (cleanupError) {
          console.error('Failed to remove incomplete fundi account:', cleanupError);
        }
        throw applicationError;
      }
    }

    // Log compliance action (terms acceptance)
    await logComplianceAction(userId, 'accept_terms', {
      ipAddress
    });

    // Send verification email
    const verificationEmailSent = await sendVerificationEmail(email, name, verificationToken);

    // Log registration audit
    await logAuditAction('register', userId, {
      status: 'success',
      statusCode: 201,
      metadata: {
        role,
        emailVerificationSent: verificationEmailSent,
        ipAddress
      }
    });

    return NextResponse.json({
      message: acceptTerms ? 'Account created successfully. Please check your email to verify your account.' : 'Account created but terms not accepted',
      userId,
      requiresEmailVerification: true,
      verificationEmailSent,
    }, { status: 201 });

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