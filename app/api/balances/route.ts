import { NextRequest, NextResponse } from 'next/server';
import { fetchAllTokenBalances, isValidAddress } from '../../../lib/blockchain';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  console.log('API /api/balances called with address:', address);

  if (!address || !isValidAddress(address)) {
    console.log('Invalid address');
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  try {
    console.log('Calling fetchAllTokenBalances');
    const balances = await fetchAllTokenBalances(address);
    console.log('Balances fetched:', balances);
    return NextResponse.json(balances);
  } catch (error) {
    console.log('Error in /api/balances:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }
}