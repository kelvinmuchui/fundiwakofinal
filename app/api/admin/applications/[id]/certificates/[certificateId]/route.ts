import { Binary, ObjectId, type Document } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';

interface StoredCertificate extends Document {
  _id: ObjectId;
  applicationId: ObjectId;
  filename: string;
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png';
  data: Binary;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; certificateId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, certificateId } = await params;
    if (!ObjectId.isValid(id) || !ObjectId.isValid(certificateId)) {
      return NextResponse.json({ error: 'Invalid certificate request' }, { status: 400 });
    }

    const certificates = await getCollection<StoredCertificate>('worker_application_certificates');
    const certificate = await certificates.findOne({
      _id: new ObjectId(certificateId),
      applicationId: new ObjectId(id),
    });
    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const contentType = ['application/pdf', 'image/jpeg', 'image/png'].includes(certificate.contentType)
      ? certificate.contentType
      : 'application/octet-stream';
    const filename = certificate.filename.replace(/[\r\n"]/g, '_');
    const fallbackFilename = filename.replace(/[^\x20-\x7e]/g, '_').replace(/[\\;]/g, '_');
    const bytes = certificate.data.value();
    const responseBody = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(responseBody).set(bytes);

    return new NextResponse(responseBody, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fallbackFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error retrieving fundi application certificate:', error);
    return NextResponse.json({ error: 'Failed to retrieve certificate' }, { status: 500 });
  }
}
