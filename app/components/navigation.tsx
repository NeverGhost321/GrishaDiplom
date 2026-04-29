'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/components', label: 'Каталог' },
  { href: '/auto-build', label: 'Автоподбор' },
  { href: '/manual-build', label: 'Ручная сборка' },
  { href: '/saved-builds', label: 'Сохранённые' },
  { href: '/account', label: 'Кабинет' }
];

export function Navigation() {
  const pathname = usePathname();
  return <nav className="overflow-x-auto"><ul className="flex min-w-max items-center gap-2">{navItems.map((item)=>{const active=item.href==='/'?pathname==='/':pathname?.startsWith(item.href); return <li key={item.href}><Link href={item.href} className={`rounded-xl px-3 py-2 text-sm ${active?'bg-slate-900 text-white':'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>{item.label}</Link></li>;})}</ul></nav>;
}
