'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

type User = { id:number; email:string; name:string; bio:string|null; avatarUrl:string|null; buildsCount:number; role:'ADMIN'|'USER' };

export default function AccountPage(){const [user,setUser]=useState<User|null>(null);const [error,setError]=useState('');const [saving,setSaving]=useState(false);
useEffect(()=>{void fetch('/api/auth/me').then(async(r)=>{const d=await r.json();if(!r.ok)return setError('Войдите в аккаунт.');setUser(d.user);});},[]);
async function save(){if(!user)return;setSaving(true);const res=await fetch('/api/auth/me',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:user.name,bio:user.bio,avatarUrl:user.avatarUrl})});const data=await res.json();if(res.ok)setUser({...user,...data.user,buildsCount:user.buildsCount});setSaving(false);} 
if(error)return <p className='text-sm text-red-600'>{error}</p>; if(!user)return <p>Загрузка...</p>;
return <section className='space-y-6'><h1 className='text-3xl font-semibold text-slate-900'>Личный кабинет</h1><Card><div className='flex items-center gap-4'><img src={user.avatarUrl||'https://placehold.co/96x96?text=Avatar'} alt='avatar' className='h-20 w-20 rounded-full border border-slate-200 object-cover'/><div><p className='font-medium text-slate-900'>{user.name}</p><p className='text-sm text-slate-600'>{user.email}</p><p className='text-sm text-slate-600'>Сохранённых сборок: {user.buildsCount}</p><p className='text-sm text-slate-600'>Роль: {user.role}</p></div></div></Card><Card><div className='space-y-3'><label className='ui-label'><span>Имя</span><input className='ui-input' value={user.name} onChange={(e)=>setUser({...user,name:e.target.value})}/></label><label className='ui-label'><span>О себе</span><textarea className='ui-input min-h-24' value={user.bio||''} onChange={(e)=>setUser({...user,bio:e.target.value})}/></label><label className='ui-label'><span>Ссылка на аватар</span><input className='ui-input' value={user.avatarUrl||''} onChange={(e)=>setUser({...user,avatarUrl:e.target.value})}/></label><Button onClick={save} loading={saving}>Сохранить</Button></div></Card></section>;}
