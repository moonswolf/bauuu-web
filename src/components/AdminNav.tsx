'use client';

import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Utenti', icon: '👥' },
  { href: '/admin/moderation', label: 'Segnalazioni', icon: '🚩' },
  { href: '/admin/photos', label: 'Foto', icon: '📷' },
  { href: '/admin/flags', label: 'Feature Flags', icon: '🏁' },
  { href: '/admin/seed', label: 'Seed', icon: '🌱' },
  { href: '/admin/audit', label: 'Audit Log', icon: '📋' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
        <button onClick={() => router.push('/admin' as never)} className="font-bold text-primary-500 mr-4 whitespace-nowrap">
          Bauuu Admin
        </button>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href as never)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => router.push('/app/discover')}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
        >
          Torna all&apos;app
        </button>
      </div>
    </nav>
  );
}
