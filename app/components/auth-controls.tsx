'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type MeUser = { id: number; name: string; role?: 'ADMIN' | 'USER' };

export function AuthControls() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    void fetch('/api/auth/me')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) return setUser(null);
        setUser(data.user);
      })
      .finally(() => setLoaded(true));
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.refresh();
    router.push('/');
  }

  if (!loaded) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-full border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10">
          Войти
        </Link>
        <Link href="/register" className="rounded-full border border-blue-400/50 bg-blue-500/20 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/30">
          Регистрация
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.role === 'ADMIN' && (
        <Link href="/admin" className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 hover:bg-amber-500/20">
          Admin
        </Link>
      )}
      <Link href="/account" className="rounded-full border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10">
        {user.name}
      </Link>
      <button onClick={logout} className="rounded-full border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10">
        Выйти
      </button>
    </div>
  );
}
