import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/fundi/[id]/portfolio - Get portfolio items for a fundi
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const portfolioCollection = await getCollection('portfolio');
    const items = await portfolioCollection
      .find({ fundiId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fundi/[id]/portfolio - Add a portfolio item (fundi only)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, beforePhoto, afterPhoto, photos } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const portfolioCollection = await getCollection('portfolio');

    const portfolioItem = {
      fundiId: id,
      title: title.trim(),
      description: description.trim(),
      category: category || 'general',
      beforePhoto: beforePhoto || null,
      afterPhoto: afterPhoto || null,
      photos: photos || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await portfolioCollection.insertOne(portfolioItem);

    return NextResponse.json(
      { message: 'Portfolio item added', itemId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/fundi/[id]/portfolio - Delete a portfolio item
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!user || user.id !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId || !ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const portfolioCollection = await getCollection('portfolio');
    const result = await portfolioCollection.deleteOne({
      _id: new ObjectId(itemId),
      fundiId: id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Portfolio item deleted' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
