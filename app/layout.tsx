import type { Metadata } from 'next';
import { Navigation } from './components/navigation';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Конфигуратор игровых ПК',
  description: 'Минималистичный сервис для подбора совместимых игровых сборок.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
            <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">Конфигуратор игровых ПК</h1>
            <Navigation />
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-80px)] w-full max-w-6xl px-4 py-10 sm:px-6">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </body>
    </html>
  );
}
