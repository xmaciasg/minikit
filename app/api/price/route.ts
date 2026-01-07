import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Obtener precio de WLD desde CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld&vs_currencies=usd',
      { next: { revalidate: 60 } } // Cache por 60 segundos
    );

    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await response.json();
    const price = data['worldcoin-wld']?.usd || 0;

    return NextResponse.json({ price });
  } catch (error) {
    console.error('Error fetching WLD price:', error);
    return NextResponse.json({ price: 0, error: 'Failed to fetch price' }, { status: 500 });
  }
}
