import { Binary, ObjectId, type Document } from 'mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prepareCertificates } from '@/lib/certificates';
import { getCollection } from '@/lib/db';

interface StoredCertificate extends Document {
  _id?: ObjectId;
  fundiId?: ObjectId;
  applicationId?: ObjectId;
  filename: string;
  contentType: 'application/pdf' | 'image/jpeg' | 'image/png';
  size: number;
  data: Binary;
  createdAt: Date;
}

type CertificateListItem = {
  id: string;
  filename: string;
  contentType?: string;
  size?: number;
  createdAt?: Date;
  url?: string;
};

function getSafeCertificateUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
}

async function getFundi() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { email?: string; role?: string } | undefined;
  if (!sessionUser?.email || sessionUser.role !== 'fundi') return null;

  const users = await getCollection('users');
  return users.findOne(
    { email: sessionUser.email, role: 'fundi' },
    { projection: { _id: 1, email: 1, certificates: 1 } },
  );
}

export async function GET() {
  try {
    const fundi = await getFundi();
    if (!fundi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const certificates: CertificateListItem[] = [];
    const legacyUrls = Array.isArray(fundi.certificates) ? fundi.certificates : [];
    for (const [index, url] of legacyUrls.entries()) {
      const safeUrl = getSafeCertificateUrl(url);
      if (safeUrl) {
        certificates.push({ id: `legacy-user-${index}`, filename: safeUrl.split('/').pop() || 'Certificate', url: safeUrl });
      }
    }

    const applications = await (await getCollection('worker_applications'))
      .find(
        {
          $or: [
            { userId: fundi._id.toString() },
            { email: fundi.email.toLowerCase() },
            { email: fundi.email },
          ],
        },
        { projection: { _id: 1, certificates: 1 } },
      )
      .toArray();
    const applicationIds = applications
      .map((application) => application._id)
      .filter((id): id is ObjectId => id instanceof ObjectId);

    for (const application of applications) {
      if (!Array.isArray(application.certificates)) continue;
      for (const certificate of application.certificates) {
        if (typeof certificate === 'string') {
          const safeUrl = getSafeCertificateUrl(certificate);
          if (safeUrl) {
            certificates.push({
              id: `legacy-application-${certificates.length}`,
              filename: safeUrl.split('/').pop() || 'Certificate',
              url: safeUrl,
            });
          }
        } else if (certificate && typeof certificate.id === 'string') {
          certificates.push({
            id: certificate.id,
            filename: certificate.filename,
            contentType: certificate.contentType,
            size: certificate.size,
          });
        }
      }
    }

    if (applicationIds.length > 0) {
      const storedApplicationCertificates = await (await getCollection<StoredCertificate>('worker_application_certificates'))
        .find({ applicationId: { $in: applicationIds } }, { projection: { data: 0 } })
        .toArray();
      const savedIds = new Set(certificates.map((certificate) => certificate.id));
      for (const certificate of storedApplicationCertificates) {
        if (!certificate._id) continue;
        const id = certificate._id.toString();
        if (!savedIds.has(id)) {
          certificates.push({
            id,
            filename: certificate.filename,
            contentType: certificate.contentType,
            size: certificate.size,
            createdAt: certificate.createdAt,
          });
        }
      }
    }

    const profileCertificates = await (await getCollection<StoredCertificate>('fundi_certificates'))
      .find({ fundiId: fundi._id }, { projection: { data: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    for (const certificate of profileCertificates) {
      if (!certificate._id) continue;
      certificates.push({
        id: certificate._id.toString(),
        filename: certificate.filename,
        contentType: certificate.contentType,
        size: certificate.size,
        createdAt: certificate.createdAt,
      });
    }

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Error listing fundi certificates:', error);
    return NextResponse.json({ error: 'Failed to load certificates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const fundi = await getFundi();
    if (!fundi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const submittedFiles = formData.getAll('certificates');
    if (submittedFiles.length === 0 || submittedFiles.some((entry) => !(entry instanceof File))) {
      return NextResponse.json({ error: 'Choose one or more certificate files to upload' }, { status: 400 });
    }

    const validation = await prepareCertificates(
      submittedFiles.filter((entry): entry is File => entry instanceof File && entry.size > 0),
    );
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    if (validation.certificates.length === 0) {
      return NextResponse.json({ error: 'Choose one or more certificate files to upload' }, { status: 400 });
    }

    const collection = await getCollection<StoredCertificate>('fundi_certificates');
    const createdAt = new Date();
    const inserted = await collection.insertMany(
      validation.certificates.map((certificate) => ({
        fundiId: fundi._id,
        filename: certificate.filename,
        contentType: certificate.contentType,
        size: certificate.size,
        data: new Binary(certificate.data),
        createdAt,
      })),
    );
    const certificates = validation.certificates.map((certificate, index) => ({
      id: inserted.insertedIds[index].toString(),
      filename: certificate.filename,
      contentType: certificate.contentType,
      size: certificate.size,
      createdAt,
    }));

    return NextResponse.json({ certificates }, { status: 201 });
  } catch (error) {
    console.error('Error uploading fundi certificates:', error);
    return NextResponse.json({ error: 'Failed to upload certificates' }, { status: 500 });
  }
}
