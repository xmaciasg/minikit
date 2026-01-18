import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { transactions, recipients, agents } from '../../../lib/schema';

export async function POST(req: NextRequest) {
  const { table } = await req.json();

  try {
    if (table === 'all') {
      await db.delete(transactions);
      await db.delete(recipients);
      await db.delete(agents);
    } else if (table === 'transactions') {
      await db.delete(transactions);
    } else if (table === 'recipients') {
      await db.delete(recipients);
    } else if (table === 'agents') {
      await db.delete(agents);
    } else {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Table(s) cleared' });
  } catch (error) {
    console.error('Error clearing table:', error);
    return NextResponse.json({ error: 'Failed to clear table' }, { status: 500 });
  }
}