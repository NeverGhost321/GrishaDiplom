import Link from 'next/link';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';

export default function HomePage() {
  return (
    <section className="space-y-8">
      <Card className="space-y-4" title="Конфигуратор игровых ПК" description="Веб-приложение для подбора совместимых игровых конфигураций.">
        <p className="text-slate-300">
          Проект разработан как практическая часть ВКР и демонстрирует проверку аппаратной совместимости комплектующих, оценку баланса системы и поддержку процесса выбора оптимальной конфигурации.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/auto-build" data-testid="cta-auto-build"><Button size="lg">Подобрать игровой ПК</Button></Link>
          <Link href="/manual-build" data-testid="cta-manual-build"><Button size="lg" variant="secondary">Собрать вручную</Button></Link>
        </div>
      </Card>

      <Card title="Что проверяет приложение">
        <ul className="list-inside list-disc space-y-1 text-slate-300">
          <li>совместимость CPU и материнской платы;</li>
          <li>тип и частоту RAM;</li>
          <li>мощность блока питания;</li>
          <li>PCIe и накопители;</li>
          <li>габариты корпуса;</li>
          <li>охлаждение;</li>
          <li>баланс CPU и GPU.</li>
        </ul>
      </Card>

      <Card title="Для чего это нужно">
        <ul className="list-inside list-disc space-y-1 text-slate-300">
          <li>снижение риска ошибок при сборке;</li>
          <li>подбор конфигурации по бюджету;</li>
          <li>объяснение предупреждений и ограничений;</li>
          <li>демонстрация практической части ВКР.</li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/catalog" data-testid="cta-catalog" className="text-blue-300 hover:text-blue-200">Перейти в каталог комплектующих →</Link>
        <Link href="/about" className="text-blue-300 hover:text-blue-200">Подробнее о проекте →</Link>
      </div>
    </section>
  );
}
