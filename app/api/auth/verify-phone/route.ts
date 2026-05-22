import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getCollection } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Mock database for OTPs (In a real app, use Redis or a DB collection with TTL)
const otpStore: Record<string, { otp: string; expires: number }> = {};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, phone, otp } = body;

    if (action === 'send') {
      if (!phone) return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });

      // Generate a 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with 5-minute expiration
      otpStore[phone] = {
        otp: generatedOtp,
        expires: Date.now() + 5 * 60 * 1000
      };

      console.log(`[MOCK SMS] Sending OTP ${generatedOtp} to ${phone}`);
      
      return NextResponse.json({ 
        message: 'OTP sent successfully (Check server logs)', 
        mockOtp: process.env.NODE_ENV === 'development' ? generatedOtp : undefined 
      });
    }

    if (action === 'verify') {
      if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });

      const stored = otpStore[phone];
      if (!stored || stored.expires < Date.now()) {
        return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
      }

      if (stored.otp !== otp) {
        return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }

      // Clear OTP
      delete otpStore[phone];

      // Update user in DB
      const usersCollection = await getCollection('users');
      await usersCollection.updateOne(
        { email: session.user.email },
        { 
          $set: { 
            phoneVerified: true, 
            phoneVerifiedAt: new Date(),
            phone: phone // Ensure phone is updated if it was different
          } 
        }
      );

      return NextResponse.json({ message: 'Phone verified successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
