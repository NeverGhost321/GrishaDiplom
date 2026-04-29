'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';

export default function RegisterPage(){const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const router=useRouter();async function submit(e:React.FormEvent){e.preventDefault();setError('');const res=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});const data=await res.json();if(!res.ok)return setError(data.error||'Ошибка регистрации');router.push('/account');router.refresh();}
return <section className="mx-auto max-w-md"><Card><form onSubmit={submit} className="space-y-4"><h1 className="text-3xl font-semibold text-slate-900">Регистрация</h1><label className="ui-label"><span>Имя</span><input className="ui-input" value={name} onChange={(e)=>setName(e.target.value)} /></label><label className="ui-label"><span>Email</span><input className="ui-input" value={email} onChange={(e)=>setEmail(e.target.value)} /></label><label className="ui-label"><span>Пароль</span><input type="password" className="ui-input" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>{error&&<p className="text-sm text-red-600">{error}</p>}<Button type="submit" className="w-full">Создать аккаунт</Button><p className="text-sm text-slate-600">Уже есть аккаунт? <Link className="text-blue-600" href="/login">Войти</Link></p></form></Card></section>;}
