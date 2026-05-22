import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import type { User } from '@/lib/models/User';
import { logAuditAction } from '@/lib/auditLog';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>('users');

    // Find user with matching verification token
    const user = await usersCollection.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      await logAuditAction('verify-email', 'unknown', {
        status: 'failure',
        statusCode: 400,
        errorMessage: 'Invalid or expired verification token',
        metadata: { ipAddress }
      });

      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          verificationToken: '',
          verificationTokenExpires: ''
        }
      }
    );

    const userId = user._id ? user._id.toString() : 'unknown';
    await logAuditAction('verify-email', userId, {
      status: 'success',
      statusCode: 200,
      metadata: { ipAddress }
    });

    return NextResponse.json({
      message: 'Email verified successfully. You can now log in.',
      verified: true
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to resend verification email
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new verification token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken: newToken,
          verificationTokenExpires: expiresAt,
          updatedAt: new Date()
        }
      }
    );

    // Send verification email
    const { sendVerificationEmail } = await import('@/lib/emailService');
    const emailSent = await sendVerificationEmail(email, user.name, newToken);

    const userId = user._id ? user._id.toString() : 'unknown';
    await logAuditAction('resend-verification-email', userId, {
      status: emailSent ? 'success' : 'failure',
      metadata: { ipAddress }
    });

    return NextResponse.json({
      message: emailSent ? 'Verification email sent successfully' : 'Failed to send email. Please try again later.',
      emailSent
    }, { status: emailSent ? 200 : 500 });

  } catch (error) {
    console.error('Resend verification email error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
