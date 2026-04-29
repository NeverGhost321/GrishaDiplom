import type { Metadata } from 'next';
import { Navigation } from './components/navigation';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/Toast';

export const metadata: Metadata = { title: 'Конфигуратор игровых ПК', description: 'Современный сервис подбора совместимых игровых сборок.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8"><p className="text-lg font-semibold text-slate-900">PC Configurator</p><Navigation /></div></header><main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ToastProvider>{children}</ToastProvider></main></body></html>;
}
