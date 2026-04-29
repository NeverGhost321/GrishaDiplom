'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/components', label: 'Каталог' },
  { href: '/auto-build', label: 'Автоподбор' },
  { href: '/manual-build', label: 'Ручная сборка' },
  { href: '/saved-builds', label: 'Сохранённые сборки' },
  { href: '/login', label: 'Вход' },
  { href: '/register', label: 'Регистрация' }
];

export function Navigation() {
  const pathname = usePathname();
  return <nav className="overflow-x-auto"><ul className="flex min-w-max items-center gap-2">{navItems.map((item)=>{const active=item.href==='/'?pathname==='/':pathname?.startsWith(item.href); return <li key={item.href}><Link href={item.href} className={`rounded-full border px-3 py-2 text-sm transition ${active?'border-blue-400/40 bg-blue-500/20 text-blue-200':'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>{item.label}</Link></li>;})}</ul></nav>;
}
