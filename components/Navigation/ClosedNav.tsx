'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ClosedNav = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/agentes', label: 'Agentes' },
    { href: '/recipient', label: 'Destinatario' },
    { href: '/transacciones', label: 'Transacciones' },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-700 mb-6">
      <div className="container mx-auto flex gap-4 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pathname === item.href
                ? 'bg-white text-black'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};
