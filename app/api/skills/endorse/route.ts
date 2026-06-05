import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getCollection } from '@/lib/db';
import { logAuditAction } from '@/lib/auditLog';
import type { Skill, SkillEndorsement } from '@/lib/models/Skill';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUserId, skillName, message } = body;

    if (!targetUserId || !skillName) {
      return NextResponse.json(
        { error: 'Target user ID and skill name are required' },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection('users');
    const skillsCollection = await getCollection('skills');
    const endorsementsCollection = await getCollection('skillEndorsements');

    // Get current user
    const currentUser = await usersCollection.findOne({ email: session.user.email });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-endorsement
    if (currentUser._id?.toString() === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot endorse your own skills' },
        { status: 400 }
      );
    }

    // Check if users are connected
    const connectionsCollection = await getCollection('connections');
    const connection = await connectionsCollection.findOne({
      $or: [
        { userId: currentUser._id?.toString(), connectedUserId: targetUserId, status: 'accepted' },
        { userId: targetUserId, connectedUserId: currentUser._id?.toString(), status: 'accepted' }
      ]
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'You must be connected to endorse a skill' },
        { status: 403 }
      );
    }

    // Find the skill
    const skill = await skillsCollection.findOne({
      userId: targetUserId,
      name: { $regex: new RegExp(skillName, 'i') }
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found for this user' },
        { status: 404 }
      );
    }

    // Check if already endorsed in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const existingEndorsement = await endorsementsCollection.findOne({
      endorserId: currentUser._id?.toString(),
      skillId: skill._id?.toString(),
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (existingEndorsement) {
      return NextResponse.json(
        { error: 'You have already endorsed this skill in the last 30 days' },
        { status: 400 }
      );
    }

    // Create endorsement
    const endorsement: SkillEndorsement = {
      endorserId: currentUser._id?.toString() || '',
      skillOwnerId: targetUserId,
      skillId: skill._id?.toString() || '',
      skillName: skillName,
      message: message,
      status: 'accepted',
      createdAt: new Date()
    };

    const endorsementResult = await endorsementsCollection.insertOne(endorsement);

    // Update skill endorsement count and list
    await skillsCollection.updateOne(
      { _id: skill._id },
      {
        $inc: { endorsementCount: 1 },
        $push: {
          endorsedBy: {
            userId: currentUser._id?.toString(),
            endorsedAt: new Date()
          }
        },
        $set: { updatedAt: new Date(), lastEndorsedAt: new Date() }
      } as any
    );

    // Update user's endorsed skills count
    await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      {
        $inc: { 'endorsedSkills.$[elem].endorsementCount': 1 },
        $set: { updatedAt: new Date() }
      },
      {
        arrayFilters: [{ 'elem.name': { $regex: new RegExp(skillName, 'i') } }]
      } as any
    );

    // Log audit action
    await logAuditAction(
      'skill_endorsed',
      currentUser._id?.toString() || '',
      {
        targetUserId,
        status: 'success',
        metadata: {
          skillName,
          endorsementId: endorsementResult.insertedId
        }
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Skill endorsed successfully',
        endorsement: endorsement
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Skill endorsement error:', error);
    return NextResponse.json(
      { error: 'Failed to endorse skill' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const skillsCollection = await getCollection('skills');

    // Get all skills for the user with their endorsement counts
    const skills = await skillsCollection
      .find({ userId })
      .sort({ endorsementCount: -1, isPrimary: -1 })
      .toArray();

    return NextResponse.json({
      skills,
      totalSkills: skills.length,
      totalEndorsements: skills.reduce((sum, skill) => sum + (skill.endorsementCount || 0), 0)
    });
  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
