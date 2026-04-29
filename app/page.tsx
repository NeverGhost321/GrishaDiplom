import Link from 'next/link';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

const features = [
  ['Проверка совместимости', 'Проверяем сокеты, питание, габариты и интерфейсы.'],
  ['Подбор по бюджету', 'Алгоритм подбирает баланс цены и производительности.'],
  ['Расчёт энергопотребления', 'Показываем потребление и рекомендуемую мощность БП.'],
  ['Экспорт конфигурации', 'Готовая сборка в JSON и PDF для отчётов и защиты.']
];

export default function HomePage() {return <section className="space-y-12"><Card className="p-8 sm:p-10"><p className="mb-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">Конфигуратор игровых ПК</p><h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Подбор совместимой игровой сборки без ошибок</h1><p className="mt-4 max-w-2xl text-base text-slate-600">Сервис для быстрого подбора ПК под бюджет и задачи с прозрачной проверкой совместимости.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/auto-build"><Button size="lg">Автоматический подбор</Button></Link><Link href="/manual-build"><Button variant="secondary" size="lg">Собрать вручную</Button></Link></div></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{features.map(([title,text])=><Card key={title}><h3 className="text-base font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm text-slate-600">{text}</p></Card>)}</div><Card><h2 className="text-2xl font-semibold text-slate-900">Как это работает</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{['Укажите бюджет и сценарий','Получите готовую конфигурацию','Сохраните и экспортируйте результат'].map((s,i)=><div key={s} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Шаг {i+1}</p><p className="mt-1 font-medium text-slate-800">{s}</p></div>)}</div></Card></section>; }
