'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Ошибка регистрации');
    router.push('/account');
    router.refresh();
  }

  return <form onSubmit={submit} className="mx-auto max-w-md space-y-3"><h2 className="text-2xl font-bold">Регистрация</h2><input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Имя" value={name} onChange={(e)=>setName(e.target.value)} /><input className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input type="password" className="w-full rounded border border-slate-700 bg-slate-900 p-2" placeholder="Пароль" value={password} onChange={(e)=>setPassword(e.target.value)} />{error && <p className="text-red-400">{error}</p>}<button className="rounded bg-blue-600 px-4 py-2">Создать аккаунт</button></form>;
}
