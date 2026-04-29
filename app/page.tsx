export default function HomePage() {
  return (
    <section className="space-y-6">
      <h2 className="text-3xl font-bold">Добро пожаловать!</h2>
      <p className="text-slate-300">
        Это базовая версия веб-приложения для ВКР на тему исследования проблем аппаратной
        совместимости комплектующих у современных ПК с игровыми конфигурациями.
      </p>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h3 className="mb-2 text-lg font-semibold">Планируемые возможности</h3>
        <ul className="list-inside list-disc space-y-1 text-slate-300">
          <li>Автоматический подбор совместимой игровой сборки по бюджету.</li>
          <li>Ручная сборка ПК с проверкой аппаратной совместимости в реальном времени.</li>
          <li>Расширяемая база комплектующих на Prisma + SQLite.</li>
        </ul>
      </div>
    </section>
  );
}
