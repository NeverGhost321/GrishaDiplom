'use client';
import { useEffect, useState } from 'react';

type User = { id:number; email:string; name:string; bio:string|null; avatarUrl:string|null; buildsCount:number };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { void fetch('/api/auth/me').then(async (r)=>{ const d = await r.json(); if (!r.ok) return setError('Войдите в аккаунт.'); setUser(d.user); }); }, []);

  async function save() {
    if (!user) return;
    setSaving(true);
    const res = await fetch('/api/auth/me', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: user.name, bio: user.bio, avatarUrl: user.avatarUrl }) });
    const data = await res.json();
    if (res.ok) setUser({ ...user, ...data.user, buildsCount: user.buildsCount });
    setSaving(false);
  }

  if (error) return <p>{error}</p>;
  if (!user) return <p>Загрузка...</p>;

  return <section className="space-y-4"><h2 className="text-2xl font-bold">Личный кабинет</h2><div className="rounded border border-slate-700 p-4"><img src={user.avatarUrl || 'https://placehold.co/96x96?text=Avatar'} alt="avatar" className="h-24 w-24 rounded-full object-cover" /><p className="mt-2">Сохранённых сборок: {user.buildsCount}</p><p>Email: {user.email}</p></div><div className="space-y-2"><input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={user.name} onChange={(e)=>setUser({ ...user, name: e.target.value })} /><textarea className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={user.bio || ''} onChange={(e)=>setUser({ ...user, bio: e.target.value })} placeholder="О себе" /><input className="w-full rounded border border-slate-700 bg-slate-900 p-2" value={user.avatarUrl || ''} onChange={(e)=>setUser({ ...user, avatarUrl: e.target.value })} placeholder="Ссылка на аватар" /><button className="rounded bg-blue-600 px-4 py-2" onClick={save} disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button></div></section>;
}
