import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const updateProfileSchema = z.object({
  headline: z.string().max(120).optional(),
  about: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  hourlyRate: z.string().optional(),
  availability: z.enum(['flexible', 'fulltime', 'parttime', 'weekends']).optional(),
  endorsedSkills: z.array(z.object({
    name: z.string(),
    yearsOfExperience: z.number().optional(),
    isPrimary: z.boolean().optional()
  })).optional()
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const skillsCollection = await getCollection('skills');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = currentUser._id?.toString();
    const updateData = {
      ...validation.data,
      updatedAt: new Date()
    };

    // Update skills if provided
    if (validation.data.endorsedSkills) {
      const skillIds: string[] = [];
      
      for (const skill of validation.data.endorsedSkills) {
        // Check if skill exists
        let skillDoc = await skillsCollection.findOne({
          userId,
          name: skill.name
        });

        if (!skillDoc) {
          // Create new skill
          const result = await skillsCollection.insertOne({
            userId,
            name: skill.name,
            yearsOfExperience: skill.yearsOfExperience,
            isPrimary: skill.isPrimary || false,
            endorsementCount: 0,
            endorsedBy: [],
            isVerified: false,
            visibility: 'public',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          skillIds.push(result.insertedId?.toString() || '');
        } else if (skill.isPrimary) {
          // Update primary flag
          await skillsCollection.updateOne(
            { _id: skillDoc._id },
            { $set: { isPrimary: true, updatedAt: new Date() } }
          );
        }
      }

      // Remove isPrimary from skills array to avoid storing in User
      delete (updateData as any).endorsedSkills;
    }

    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 400 }
      );
    }

    // Log audit action
    await logAuditAction({
      actionType: 'profile_updated',
      userId: userId || '',
      status: 'success',
      details: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
