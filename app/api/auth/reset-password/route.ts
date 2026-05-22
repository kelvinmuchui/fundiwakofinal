import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import type { User } from '@/lib/models/User';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { generatePasswordResetToken } from '@/lib/emailService';
import { logAuditAction } from '@/lib/auditLog';

/**
 * POST /api/auth/reset-password
 * Request password reset - sends email with reset token
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    // Don't reveal if email exists (security best practice)
    if (!user) {
      await logAuditAction('request-password-reset', 'unknown', {
        status: 'failure',
        errorMessage: 'User not found',
        metadata: { email: email.toLowerCase(), ipAddress }
      });

      return NextResponse.json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      }, { status: 200 });
    }

    // Generate password reset token (valid for 1 hour)
    const { token: resetToken, expiresAt } = generatePasswordResetToken();

    // Save reset token to database
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpires: expiresAt,
          updatedAt: new Date()
        }
      }
    );

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, user.name, resetToken);

    const userId = user._id ? user._id.toString() : 'unknown';
    await logAuditAction('request-password-reset', userId, {
      status: emailSent ? 'success' : 'failure',
      metadata: { ipAddress }
    });

    return NextResponse.json({
      message: emailSent 
        ? 'If an account exists with this email, a password reset link has been sent.'
        : 'Failed to send email. Please try again later.'
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/reset-password
 * Complete password reset with token
 */
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>('users');

    // Find user with valid reset token
    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      await logAuditAction('reset-password', 'unknown', {
        status: 'failure',
        errorMessage: 'Invalid or expired reset token',
        metadata: { ipAddress }
      });

      return NextResponse.json(
        { error: 'Invalid or expired password reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const bcrypt = await import('bcryptjs').then(mod => mod.default);
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          lastPasswordChange: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          resetToken: '',
          resetTokenExpires: ''
        }
      }
    );

    const userId = user._id ? user._id.toString() : 'unknown';
    await logAuditAction('reset-password', userId, {
      status: 'success',
      metadata: { ipAddress }
    });

    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.'
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
