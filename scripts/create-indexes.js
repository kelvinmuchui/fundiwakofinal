const { MongoClient } = require('mongodb');
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

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please set MONGODB_URI in .env.local');
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();

  console.log('Creating indexes for Phase 1 collections...\n');

  try {
    // Connections collection indexes
    console.log('📍 Creating indexes for connections collection...');
    const connectionsCol = db.collection('connections');
    await connectionsCol.createIndex({ userId: 1, status: 1 }, { name: 'userId_status' });
    await connectionsCol.createIndex({ connectedUserId: 1, status: 1 }, { name: 'connectedUserId_status' });
    await connectionsCol.createIndex({ createdAt: 1 }, { name: 'createdAt' });
    console.log('   ✓ connections indexes created\n');

    // Skills collection indexes
    console.log('📍 Creating indexes for skills collection...');
    const skillsCol = db.collection('skills');
    await skillsCol.createIndex({ userId: 1 }, { name: 'userId' });
    await skillsCol.createIndex({ userId: 1, endorsementCount: -1 }, { name: 'userId_endorsementCount' });
    await skillsCol.createIndex({ createdAt: 1 }, { name: 'createdAt' });
    console.log('   ✓ skills indexes created\n');

    // Activities collection indexes
    console.log('📍 Creating indexes for activities collection...');
    const activitiesCol = db.collection('activities');
    await activitiesCol.createIndex({ userId: 1, createdAt: -1 }, { name: 'userId_createdAt' });
    await activitiesCol.createIndex({ createdAt: 1, visibility: 1 }, { name: 'createdAt_visibility' });
    await activitiesCol.createIndex({ type: 1 }, { name: 'type' });
    console.log('   ✓ activities indexes created\n');

    // Recommendations collection indexes
    console.log('📍 Creating indexes for recommendations collection...');
    const recommendationsCol = db.collection('recommendations');
    await recommendationsCol.createIndex({ toUserId: 1, status: 1 }, { name: 'toUserId_status' });
    await recommendationsCol.createIndex({ fromUserId: 1, toUserId: 1 }, { name: 'fromUserId_toUserId' });
    await recommendationsCol.createIndex({ createdAt: 1 }, { name: 'createdAt' });
    console.log('   ✓ recommendations indexes created\n');

    // Messages collection indexes
    console.log('📍 Creating indexes for messages collection...');
    const messagesCol = db.collection('messages');
    await messagesCol.createIndex({ conversationId: 1, createdAt: -1 }, { name: 'conversationId_createdAt' });
    await messagesCol.createIndex({ fromUserId: 1 }, { name: 'fromUserId' });
    await messagesCol.createIndex({ toUserId: 1, read: 1 }, { name: 'toUserId_read' });
    console.log('   ✓ messages indexes created\n');

    // Conversations collection indexes
    console.log('📍 Creating indexes for conversations collection...');
    const conversationsCol = db.collection('conversations');
    await conversationsCol.createIndex({ participants: 1, updatedAt: -1 }, { name: 'participants_updatedAt' });
    await conversationsCol.createIndex({ updatedAt: -1 }, { name: 'updatedAt' });
    console.log('   ✓ conversations indexes created\n');

    // Bookings collection indexes (for performance)
    console.log('📍 Creating indexes for bookings collection...');
    const bookingsCol = db.collection('bookings');
    await bookingsCol.createIndex({ clientId: 1, createdAt: -1 }, { name: 'clientId_createdAt' });
    await bookingsCol.createIndex({ fundiId: 1, status: 1 }, { name: 'fundiId_status' });
    await bookingsCol.createIndex({ status: 1 }, { name: 'status' });
    console.log('   ✓ bookings indexes created\n');

    // Ratings collection indexes
    console.log('📍 Creating indexes for ratings collection...');
    const ratingsCol = db.collection('ratings');
    await ratingsCol.createIndex({ fundiId: 1 }, { name: 'fundiId' });
    await ratingsCol.createIndex({ fundiId: 1, createdAt: -1 }, { name: 'fundiId_createdAt' });
    await ratingsCol.createIndex({ clientId: 1, fundiId: 1 }, { name: 'clientId_fundiId' });
    console.log('   ✓ ratings indexes created\n');

    // Users collection indexes
    console.log('📍 Creating indexes for users collection...');
    const usersCol = db.collection('users');
    await usersCol.createIndex({ email: 1 }, { unique: true, name: 'email' });
    await usersCol.createIndex({ role: 1 }, { name: 'role' });
    await usersCol.createIndex({ isVerified: 1 }, { name: 'isVerified' });
    await usersCol.createIndex({ createdAt: -1 }, { name: 'createdAt' });
    console.log('   ✓ users indexes created\n');

    console.log('✅ All indexes created successfully!\n');

    // List all indexes
    console.log('Listing all created indexes:\n');
    const collections = [
      'connections', 'skills', 'activities', 'recommendations',
      'messages', 'conversations', 'bookings', 'ratings', 'users'
    ];

    for (const collName of collections) {
      const col = db.collection(collName);
      const indexes = await col.listIndexes().toArray();
      console.log(`${collName}:`);
      indexes.forEach(idx => {
        console.log(`  - ${idx.name || 'default'}`);
      });
      console.log();
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createIndexes().catch((err) => {
  console.error(err);
  process.exit(1);
});
