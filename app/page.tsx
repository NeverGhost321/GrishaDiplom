import Link from 'next/link';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

const features = [
  ['Проверка совместимости', 'Автоматическая валидация компонентов и предупреждения о конфликте.'],
  ['Подбор по бюджету', 'Оптимизация конфигурации под заданную сумму и разрешение.'],
  ['Расчёт энергопотребления', 'Оценка нагрузки и запаса мощности блока питания.'],
  ['Экспорт конфигурации', 'Скачивание сборки в JSON и PDF форматах.']
];

export default function HomePage() {
  return (
    <section className="space-y-10">
      <Card className="space-y-6 p-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Игровой PC-конфигуратор</p>
          <h2 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">Собирайте игровые ПК быстро, прозрачно и без ошибок совместимости</h2>
          <p className="text-base text-slate-600">Подбирайте комплектующие автоматически или вручную, контролируйте бюджет, мощность и итоговую стоимость в едином интерфейсе.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/auto-build"><Button size="lg">Автоматический подбор</Button></Link>
          <Link href="/manual-build"><Button size="lg" variant="ghost">Ручная сборка</Button></Link>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {features.map(([title, text]) => (
          <Card key={title} className="h-full">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
