'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [payfastUrl, setPayfastUrl] = useState<string>('');

  useEffect(() => {
    // Obtener la URL del entorno
    const url = process.env.NEXT_PUBLIC_PAYFAST_URL;
    if (url) {
      setPayfastUrl(`${url}/sendmoney`);
    }
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 max-w-md">
        {/* Logo/Imagen */}
        <div className="relative w-80 h-56">
          <Image
            src="/payfast.jpeg"
            alt="PayFast Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Contenido */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">PayFast</h1>
          <p className="text-gray-400 text-lg mb-8">
            Envía dinero de forma segura y rápida con WorldCoin
          </p>
        </div>

        {/* Botón de acceso a la mini-app */}
        {payfastUrl ? (
          <Link
            href={payfastUrl}
            className="bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors text-lg w-full text-center"
          >
            Acceder a PayFast
          </Link>
        ) : (
          <button
            disabled
            className="bg-gray-600 text-gray-400 font-bold py-3 px-8 rounded-lg cursor-not-allowed text-lg w-full"
          >
            Cargando...
          </button>
        )}

        {/* Footer */}
        <p className="text-gray-500 text-sm text-center mt-8">
          Powered by WorldCoin MiniKit
        </p>
      </div>
    </main>
  );
}
