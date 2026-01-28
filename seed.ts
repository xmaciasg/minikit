import { db } from './lib/db';
import { recipients } from './lib/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    // Verificar si ya existe el recipient
    const existing = await db
      .select()
      .from(recipients)
      .where(eq(recipients.wallet, '0x5660199c29ce99cadade93c80f95f1e7e7d05c57'))
      .limit(1);

    if (existing.length > 0) {
      console.log('Recipient already exists, skipping seed.');
      return;
    }

    // Insertar recipient inicial
    const result = await db.insert(recipients).values({
      name: 'Manta202',
      wallet: '0x5660199c29ce99cadade93c80f95f1e7e7d05c57',
      phone: '+593998759222',
    });

    console.log('✓ Recipient seeded successfully');
    console.log('Name: Manta202');
    console.log('Wallet: 0x5660199c29ce99cadade93c80f95f1e7e7d05c57');
    console.log('Phone: +593998759222');
  } catch (error) {
    console.error('Error during seed:', error);
    process.exit(1);
  }
}

seed();