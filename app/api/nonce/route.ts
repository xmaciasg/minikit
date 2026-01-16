import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET() {
  // Generar un nonce simple (puedes usar crypto.randomUUID() en Node 18+)
  const nonce = randomBytes(16).toString('hex');
  return NextResponse.json({ nonce });
}