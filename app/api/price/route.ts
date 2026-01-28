import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Intentar obtener precio de WLD desde CoinGecko
    const coingeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );

    if (coingeckoResponse.ok) {
      const data = await coingeckoResponse.json();
      const price = data['worldcoin-wld']?.usd;
      if (price && price > 0) {
        return NextResponse.json({ price, source: 'coingecko' });
      }
    }

    // Fallback: Intentar obtener desde Binance API
    console.log('CoinGecko falló, intentando Binance...');
    const binanceResponse = await fetch(
      'https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT'
    );

    if (binanceResponse.ok) {
      const binanceData = await binanceResponse.json();
      const price = parseFloat(binanceData.price);
      if (price && price > 0) {
        return NextResponse.json({ price, source: 'binance' });
      }
    }

    // Si ambas fallan, devolver error claro
    console.error('Error fetching WLD price from both sources');
    return NextResponse.json(
      { price: null, error: 'Error al obtener cotización' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error fetching WLD price:', error);
    return NextResponse.json(
      { price: null, error: 'Error al obtener cotización' },
      { status: 500 }
    );
  }
}

