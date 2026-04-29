import type { ReactNode } from 'react';
export function Card({ children, title, description, className = '' }: {children:ReactNode;title?:string;description?:string;className?:string}) {
  return <section className={`rounded-2xl border border-white/10 bg-[#151D2A] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}>{title?<h3 className="text-lg font-semibold text-white">{title}</h3>:null}{description?<p className="mt-1 text-sm text-slate-400">{description}</p>:null}<div className={title||description?'mt-5':''}>{children}</div></section>;
}
