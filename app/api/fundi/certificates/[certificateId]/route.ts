import { Binary, ObjectId, type Document } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getCollection } from '@/lib/db';

interface StoredCertificate extends Document {
  _id: ObjectId;
  fundiId?: ObjectId;
  applicationId?: ObjectId;
  filename: string;
  contentType: string;
  data: Binary;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as { email?: string; role?: string } | undefined;
    if (!sessionUser?.email || sessionUser.role !== 'fundi') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { certificateId } = await params;
    if (!ObjectId.isValid(certificateId)) {
      return NextResponse.json({ error: 'Invalid certificate request' }, { status: 400 });
    }

    const users = await getCollection('users');
    const fundi = await users.findOne(
      { email: sessionUser.email, role: 'fundi' },
      { projection: { _id: 1, email: 1 } },
    );
    if (!fundi) return NextResponse.json({ error: 'Fundi not found' }, { status: 404 });

    const id = new ObjectId(certificateId);
    const fundiCertificates = await getCollection<StoredCertificate>('fundi_certificates');
    let certificate = await fundiCertificates.findOne({ _id: id, fundiId: fundi._id });

    if (!certificate) {
      const applications = await (await getCollection('worker_applications'))
        .find(
          {
            $or: [
              { userId: fundi._id.toString() },
              { email: fundi.email.toLowerCase() },
              { email: fundi.email },
            ],
          },
          { projection: { _id: 1 } },
        )
        .toArray();
      const applicationIds = applications
        .map((application) => application._id)
        .filter((applicationId): applicationId is ObjectId => applicationId instanceof ObjectId);
      if (applicationIds.length > 0) {
        const applicationCertificates = await getCollection<StoredCertificate>('worker_application_certificates');
        certificate = await applicationCertificates.findOne({
          _id: id,
          applicationId: { $in: applicationIds },
        });
      }
    }

    if (!certificate) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

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
    console.error('Error retrieving fundi certificate:', error);
    return NextResponse.json({ error: 'Failed to retrieve certificate' }, { status: 500 });
  }
}
