import type { Metadata } from 'next';
import { Navigation } from './components/navigation';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/Toast';

export const metadata: Metadata = { title: 'NEXUS PC Configurator', description: 'Premium-сервис подбора совместимых игровых сборок.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8"><div><p className="text-lg font-semibold tracking-wide text-white">NEXUS <span className="text-blue-400">PC</span></p><p className="text-xs text-slate-400">Hardware Configurator</p></div><Navigation /></div></header><main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><ToastProvider>{children}</ToastProvider></main></body></html>;
}
