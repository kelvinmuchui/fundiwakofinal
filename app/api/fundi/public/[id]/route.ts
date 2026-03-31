import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const usersCollection = await getCollection('users');
    const fundi = await usersCollection.findOne(
      { _id: new ObjectId(id), role: 'fundi' },
      { projection: { password: 0 } }
    );

    if (!fundi) {
      return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });
    }

    return NextResponse.json(fundi);
  } catch (error) {
    console.error('Error fetching public fundi profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
