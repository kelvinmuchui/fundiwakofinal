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

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please set MONGODB_URI in .env.local');
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db();
  const usersCol = db.collection('users');

  console.log('Migrating skill variations to standard categories...');

  const mappings = [
    { from: 'Electrician', to: 'Electrical' },
    { from: 'Plumber', to: 'Plumbing' },
    { from: 'Carpenter', to: 'Carpentry' },
    { from: 'Painter', to: 'Painting' },
    { from: 'Mason', to: 'Masonry' },
    { from: 'Cleaner', to: 'Cleaning' },
  ];

  for (const { from, to } of mappings) {
    const result = await usersCol.updateMany(
      { skill: from },
      { $set: { skill: to } }
    );
    console.log(`Updated ${result.modifiedCount} users from '${from}' to '${to}'`);
  }

  await client.close();
  console.log('Migration completed.');
}

run().catch(console.error);
