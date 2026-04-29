export function LoadingCard({ label = 'Загрузка данных...' }: { label?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5" role="status" aria-live="polite">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-700" />
      <p className="mt-3 text-sm text-slate-300">{label}</p>
    </div>
  );
}
