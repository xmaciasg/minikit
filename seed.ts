import { db } from './lib/db';
import { recipients } from './lib/schema';

async function seed() {
  await db.insert(recipients).values({
    name: 'Manta202',
    wallet: '0x5660199c29ce99cadade93c80f95f1e7e7d05c57',
    phone: '+593998759222',
  });
  console.log('Recipient inserted');
}

seed().catch(console.error);