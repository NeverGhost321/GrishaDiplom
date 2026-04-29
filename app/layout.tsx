import type { Metadata } from 'next';
import './globals.css';

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
        <header className="border-b border-slate-800 bg-slate-900/70">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <h1 className="text-xl font-semibold text-primary">Конфигуратор игровых ПК</h1>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-72px)] max-w-5xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
