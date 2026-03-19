import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '../../../lib/db';

interface WorkerApplication {
  name: string;
  phone: string;
  idNumber: string;
  email: string;
  skill: string;
  experience: string;
  tvetInstitution: string;
  description: string;
  location: string;
  neighborhood: string;
  createdAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkerApplication = await request.json();

    // Validate required fields
    const requiredFields: (keyof WorkerApplication)[] = ['name', 'phone', 'idNumber', 'email', 'skill', 'experience', 'location'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone number (basic Kenyan format)
    const phoneRegex = /^(\+254|0)[17]\d{8}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +254XXXXXXXXX or 07XXXXXXXX' },
        { status: 400 }
      );
    }

    // Get the workers collection
    const collection = await getCollection<WorkerApplication>('worker_applications');

    // Add timestamp
    const applicationData = {
      ...body,
      createdAt: new Date(),
    };

    // Insert the application
    const result = await collection.insertOne(applicationData);

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: result.insertedId,
    });

  } catch (error) {
    console.error('Error submitting worker application:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Handle MongoDB connection errors
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('MongoNetworkError') || errorMessage.includes('connect')) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}