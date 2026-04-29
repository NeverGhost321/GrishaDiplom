import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card } from '@/src/components/ui/Card';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') redirect('/account');

  const [usersCount, buildsCount, lastUsers] = await Promise.all([
    prisma.user.count(),
    prisma.build.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Панель администратора</h1>
      <p className="text-slate-300">Особый функционал ADMIN: доступ к системной сводке и последним зарегистрированным пользователям.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-400">Пользователей</p>
          <p className="mt-2 text-3xl font-bold text-white">{usersCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Сохранённых сборок</p>
          <p className="mt-2 text-3xl font-bold text-white">{buildsCount}</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-semibold text-white">Последние пользователи</h2>
        <ul className="mt-4 space-y-2">
          {lastUsers.map((item) => (
            <li key={item.id} className="rounded-lg border border-white/10 bg-[#111827] p-3 text-sm text-slate-300">
              <span className="font-medium text-white">{item.name}</span> ({item.email}) — {item.role} · {new Date(item.createdAt).toLocaleString('ru-RU')}
            </li>
          ))}
        </ul>
      </Card>
      <Link href="/saved-builds" className="text-blue-300 hover:text-blue-200">Перейти к управлению сохранёнными сборками →</Link>
    </section>
  );
}
