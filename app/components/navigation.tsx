'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/auto-build', label: 'Автоподбор' },
  { href: '/manual-build', label: 'Ручная сборка' },
  { href: '/components', label: 'Каталог' },
  { href: '/saved-builds', label: 'Сохранённые сборки' },
  { href: '/about', label: 'О проекте' }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Основная навигация" className="overflow-x-auto">
      <ul className="flex min-w-max items-center gap-2 py-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/' ? pathname === item.href : pathname?.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
