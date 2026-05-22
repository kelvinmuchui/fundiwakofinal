import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_PROVIDER_HOST,
  port: parseInt(process.env.EMAIL_PROVIDER_PORT || '587'),
  secure: process.env.EMAIL_PROVIDER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_PROVIDER_USER,
    pass: process.env.EMAIL_PROVIDER_PASS
  }
};

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter() {
  if (!transporter) {
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️ Email service not configured. Email verification will not work.');
      console.warn('Set EMAIL_PROVIDER_* environment variables to enable email functionality.');
      return null;
    }
    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

/**
 * Generate email verification token
 * Token is valid for 24 hours
 */
export function generateVerificationToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expiresAt };
}

/**
 * Generate password reset token
 * Token is valid for 1 hour
 */
export function generatePasswordResetToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expiresAt };
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationToken: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@fundiwako.com',
      to,
      subject: 'Verify Your FundiWako Email Address',
      html: `
        <h2>Welcome to FundiWako, ${userName}!</h2>
        <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">FundiWako - Connecting skilled workers with clients</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@fundiwako.com',
      to,
      subject: 'Reset Your FundiWako Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">FundiWako - Connecting skilled workers with clients</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send welcome email (optional - for successful registration)
 */
export async function sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@fundiwako.com',
      to,
      subject: 'Welcome to FundiWako!',
      html: `
        <h2>Welcome to FundiWako!</h2>
        <p>Hi ${userName},</p>
        <p>Your account has been created successfully. You can now log in and start using our platform.</p>
        <p>
          <a href="${process.env.NEXTAUTH_URL}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Go to FundiWako
          </a>
        </p>
        <h3>What's Next?</h3>
        <ul>
          <li>Complete your profile</li>
          <li>If you're a Fundi, apply to become verified</li>
          <li>Start booking or offering services</li>
        </ul>
        <hr>
        <p style="font-size: 12px; color: #666;">FundiWako - Connecting skilled workers with clients</p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
