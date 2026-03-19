const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (!key) continue;
    const value = rest.join('=').trim().replace(/^"|"$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please set MONGODB_URI in .env.local');
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const usersCol = db.collection('users');
  const appsCol = db.collection('worker_applications');

  console.log('Connected to database:', db.databaseName);
  console.log('Collections:', await db.listCollections().toArray());

  // Clear existing entries (optional)
  console.log('Clearing existing data...');
  await usersCol.deleteMany({});
  await appsCol.deleteMany({});
  console.log('Existing data cleared.');

  const fundis = [
    {
      name: 'Kevin Mburu',
      email: 'kevin@example.com',
      phone: '+254712345678',
      password: await hashPassword('password123'),
      role: 'fundi',
      idNumber: '12345678',
      skill: 'Plumbing',
      experience: '5 years',
      description: 'Expert plumber',
      location: 'Nairobi',
      neighborhood: 'Westlands',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Amina Otieno',
      email: 'amina@example.com',
      phone: '+254723456789',
      password: await hashPassword('password123'),
      role: 'fundi',
      idNumber: '23456789',
      skill: 'Electrical',
      experience: '7 years',
      description: 'Licensed electrician',
      location: 'Nairobi',
      neighborhood: 'Karen',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Wanjiru Ndegwa',
      email: 'wanjiru@example.com',
      phone: '+254734567890',
      password: await hashPassword('password123'),
      role: 'fundi',
      idNumber: '34567890',
      skill: 'Carpentry',
      experience: '6 years',
      description: 'Furniture and cabinets specialist',
      location: 'Nairobi',
      neighborhood: 'Runda',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Mark Odhiambo',
      email: 'mark@example.com',
      phone: '+254745678901',
      password: await hashPassword('password123'),
      role: 'fundi',
      idNumber: '45678901',
      skill: 'Painting',
      experience: '3 years',
      description: 'Interior and exterior painter',
      location: 'Nairobi',
      neighborhood: 'Lavington',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Grace Kibicho',
      email: 'grace@example.com',
      phone: '+254756789012',
      password: await hashPassword('password123'),
      role: 'fundi',
      idNumber: '56789012',
      skill: 'Tiling',
      experience: '4 years',
      description: 'Tile and grout installation',
      location: 'Nairobi',
      neighborhood: 'Kilimani',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const clients = [
    {
      name: 'Daniel Mwangi',
      email: 'daniel@example.com',
      phone: '+254701234567',
      password: await hashPassword('password123'),
      role: 'client',
      idNumber: '66666666',
      homeAddress: 'P.O. Box 100',
      city: 'Nairobi',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Mary Wambui',
      email: 'mary@example.com',
      phone: '+254711234568',
      password: await hashPassword('password123'),
      role: 'client',
      idNumber: '77777777',
      homeAddress: 'P.O. Box 200',
      city: 'Nairobi',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Joshua Kimani',
      email: 'joshua@example.com',
      phone: '+254721234569',
      password: await hashPassword('password123'),
      role: 'client',
      idNumber: '88888888',
      homeAddress: 'P.O. Box 300',
      city: 'Nairobi',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const admin = [
    {
      name: 'Admin User',
      email: 'admin@fundiwako.com',
      phone: '+254700000000',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPjYQmLxZhUe', // password: admin123
      role: 'admin',
      idNumber: '00000000',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const seedUsers = [...fundis, ...clients, ...admin];
  const insertResult = await usersCol.insertMany(seedUsers);

  const applications = [
    {
      name: 'Kevin Mburu',
      phone: '+254712345678',
      idNumber: '12345678',
      email: 'kevin@example.com',
      skill: 'Plumbing',
      experience: '5 years',
      description: 'Expert plumber',
      location: 'Nairobi',
      neighborhood: 'Westlands',
      status: 'approved',
      createdAt: new Date(),
      submittedAt: new Date(),
    },
    {
      name: 'Amina Otieno',
      phone: '+254723456789',
      idNumber: '23456789',
      email: 'amina@example.com',
      skill: 'Electrical',
      experience: '7 years',
      description: 'Licensed electrician',
      location: 'Nairobi',
      neighborhood: 'Karen',
      status: 'approved',
      createdAt: new Date(),
      submittedAt: new Date(),
    },
    {
      name: 'Wanjiru Ndegwa',
      phone: '+254734567890',
      idNumber: '34567890',
      email: 'wanjiru@example.com',
      skill: 'Carpentry',
      experience: '6 years',
      description: 'Furniture and cabinets specialist',
      location: 'Nairobi',
      neighborhood: 'Runda',
      status: 'approved',
      createdAt: new Date(),
      submittedAt: new Date(),
    },
    {
      name: 'Mark Odhiambo',
      phone: '+254745678901',
      idNumber: '45678901',
      email: 'mark@example.com',
      skill: 'Painting',
      experience: '3 years',
      description: 'Interior and exterior painter',
      location: 'Nairobi',
      neighborhood: 'Lavington',
      status: 'pending',
      createdAt: new Date(),
      submittedAt: new Date(),
    },
    {
      name: 'Grace Kibicho',
      phone: '+254756789012',
      idNumber: '56789012',
      email: 'grace@example.com',
      skill: 'Tiling',
      experience: '4 years',
      description: 'Tile and grout installation',
      location: 'Nairobi',
      neighborhood: 'Kilimani',
      status: 'pending',
      createdAt: new Date(),
      submittedAt: new Date(),
    },
  ];

  const insertApps = await appsCol.insertMany(applications);

  console.log('Seeded users:', insertResult.insertedCount);
  console.log('Seeded applications:', insertApps.insertedCount);

  // Verify the data was inserted
  console.log('\nVerifying inserted data...');
  const userCount = await usersCol.countDocuments();
  const appCount = await appsCol.countDocuments();
  console.log('Total users in database:', userCount);
  console.log('Total applications in database:', appCount);

  // Show sample data
  const sampleUsers = await usersCol.find({}, { projection: { password: 0 } }).limit(3).toArray();
  console.log('\nSample users:', JSON.stringify(sampleUsers, null, 2));

  await client.close();
  console.log('Database seeding completed.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
