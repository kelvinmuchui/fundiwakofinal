import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const portfolioCategories = ['general', 'repair', 'installation', 'renovation'] as const;
const maxImageBytes = 2 * 1024 * 1024;
const maxPortfolioImages = 4;
const maxTotalImageBytes = 8 * 1024 * 1024;

function isImageDataUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = value.match(/^data:image\/(jpeg|png|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/);
  if (!match) return false;
  const base64Length = match[2].length;
  const byteLength = Math.floor((base64Length * 3) / 4) - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0);
  return byteLength <= maxImageBytes;
}

function imageByteLength(value: string) {
  const base64 = value.slice(value.indexOf(',') + 1);
  return Math.floor((base64.length * 3) / 4) - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
}

async function isFundiOwner(id: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  return user?.role === 'fundi' && user.id === id;
}

// GET /api/fundi/[id]/portfolio - Get portfolio items for a fundi
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid fundi ID' }, { status: 400 });
    }

    const portfolioCollection = await getCollection('portfolio');
    const items = await portfolioCollection
      .find({ fundiId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      items: items.map((item) => ({
        _id: item._id.toString(),
        title: item.title,
        description: item.description,
        category: item.category || 'general',
        beforePhoto: item.beforePhoto || undefined,
        afterPhoto: item.afterPhoto || undefined,
        photos: Array.isArray(item.photos) ? item.photos : [],
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fundi/[id]/portfolio - Add a portfolio item (fundi only)
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!ObjectId.isValid(id) || !(await isFundiOwner(id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid portfolio item' }, { status: 400 });
    }

    const { title, description, category, beforePhoto, afterPhoto, photos } = body as Record<string, unknown>;
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 120 ||
        typeof description !== 'string' || !description.trim() || description.trim().length > 2000) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    if (typeof category !== 'string' || !portfolioCategories.includes(category as (typeof portfolioCategories)[number])) {
      return NextResponse.json({ error: 'Invalid portfolio category' }, { status: 400 });
    }

    if (
      (beforePhoto !== undefined && beforePhoto !== '' && !isImageDataUrl(beforePhoto)) ||
      (afterPhoto !== undefined && afterPhoto !== '' && !isImageDataUrl(afterPhoto)) ||
      !Array.isArray(photos) ||
      !photos.every(isImageDataUrl)
    ) {
      return NextResponse.json({ error: 'Portfolio photos must be valid JPEG, PNG, GIF, or WebP images under 2MB each' }, { status: 400 });
    }

    const imageList = [beforePhoto, afterPhoto, ...photos].filter(
      (photo): photo is string => typeof photo === 'string' && photo.length > 0,
    );
    if (imageList.length > maxPortfolioImages) {
      return NextResponse.json({ error: `You can add up to ${maxPortfolioImages} photos per project` }, { status: 400 });
    }
    if (imageList.reduce((total, photo) => total + imageByteLength(photo), 0) > maxTotalImageBytes) {
      return NextResponse.json({ error: 'The total size of portfolio photos must be 8MB or less' }, { status: 400 });
    }

    const portfolioCollection = await getCollection('portfolio');

    const portfolioItem = {
      fundiId: id,
      title: title.trim(),
      description: description.trim(),
      category,
      beforePhoto: typeof beforePhoto === 'string' && beforePhoto ? beforePhoto : null,
      afterPhoto: typeof afterPhoto === 'string' && afterPhoto ? afterPhoto : null,
      photos,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await portfolioCollection.insertOne(portfolioItem);

    return NextResponse.json(
      {
        message: 'Portfolio item added',
        item: { ...portfolioItem, _id: result.insertedId.toString() },
      },
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
    if (!ObjectId.isValid(id) || !(await isFundiOwner(id))) {
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
