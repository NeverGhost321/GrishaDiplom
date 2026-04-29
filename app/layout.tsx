import type { Metadata } from 'next';
import { Navigation } from './components/navigation';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/Toast';

export const metadata: Metadata = {
  title: 'Конфигуратор игровых ПК',
  description:
    'Веб-приложение для исследования аппаратной совместимости комплектующих игровых ПК.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <h1 className="text-lg font-semibold text-blue-300 sm:text-xl">Конфигуратор игровых ПК</h1>
            </div>
            <Navigation />
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-112px)] w-full max-w-6xl px-4 py-8 sm:px-6"><ToastProvider>{children}</ToastProvider></main>
      </body>
    </html>
  );
}
