import { getCollection } from '@/lib/db';
import { Activity, ActivityType } from '@/lib/models/Activity';

export async function logActivity(
  userId: string,
  type: ActivityType,
  title: string,
  description?: string,
  options?: {
    relatedUserId?: string;
    relatedJobId?: string;
    relatedSkillId?: string;
    metadata?: Record<string, any>;
    visibility?: 'public' | 'connections' | 'private';
  }
): Promise<string | null> {
  try {
    const activitiesCollection = await getCollection('activities');

    const activity: Activity = {
      userId,
      type,
      title,
      description,
      relatedUserId: options?.relatedUserId,
      relatedJobId: options?.relatedJobId,
      relatedSkillId: options?.relatedSkillId,
      metadata: options?.metadata || {},
      visibility: options?.visibility || 'connections',
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date()
    };

    const result = await activitiesCollection.insertOne(activity);
    return result.insertedId?.toString() || null;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}

export async function getActivityFeed(
  userId: string,
  limit: number = 20,
  skip: number = 0
): Promise<{ activities: any[]; total: number }> {
  try {
    const usersCollection = await getCollection('users');
    const activitiesCollection = await getCollection('activities');

    // Get user's connections
    const user = await usersCollection.findOne({ _id: userId });
    const connections = user?.connections || [];

    // Build query
    const query = {
      $or: [
        { userId: { $in: connections }, visibility: { $in: ['public', 'connections'] } },
        { userId, visibility: { $in: ['public', 'private', 'connections'] } }
      ]
    };

    const total = await activitiesCollection.countDocuments(query);
    const activities = await activitiesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return { activities, total };
  } catch (error) {
    console.error('Error getting activity feed:', error);
    return { activities: [], total: 0 };
  }
}

export async function getActivityStats(userId: string) {
  try {
    const activitiesCollection = await getCollection('activities');

    const stats = await activitiesCollection
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray();

    return stats;
  } catch (error) {
    console.error('Error getting activity stats:', error);
    return [];
  }
}
