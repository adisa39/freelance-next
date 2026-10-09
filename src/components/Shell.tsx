'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, fmtMoney, useApi } from '@/lib/client';

export type NavItem = { href: string; label: string };

export default function Shell({ title, nav, children }: { title: string; nav: NavItem[]; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { data: me } = useApi<{ name: string; balance?: number; role: string }>('/api/auth/me');
  const [open, setOpen] = useState(false);
  const { data: notes, reload } = useApi<{ _id: string; title: string; body: string; read: boolean; url?: string }[]>('/api/notifications');
  useEffect(() => { const t = setInterval(reload, 30000); return () => clearInterval(t); }, [reload]);
  const unread = notes?.filter((n) => !n.read).length ?? 0;
  const logout = async () => { await api('/api/auth/logout', { method: 'POST', body: {} }); router.push('/login'); router.refresh(); };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <Link href="/" className="mb-6 block text-lg font-bold text-indigo-600">{title}</Link>
        <nav className="space-y-1">
          {nav.map((n) => {
            const active = n.href === nav[0].href ? path === n.href : path.startsWith(n.href);
            return <Link key={n.href} href={n.href} className={`block rounded-lg px-3 py-2 text-sm ${active ? 'bg-indigo-50 font-medium text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{n.label}</Link>;
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="text-sm text-slate-500">{me?.name}</div>
          <div className="relative flex items-center gap-4 text-sm">
            {me?.balance !== undefined && <span className="font-medium">{fmtMoney(me.balance)}</span>}
            <button onClick={() => { setOpen(!open); if (!open && unread) api('/api/notifications', { method: 'POST', body: {} }).then(reload); }} className="relative">
              🔔{unread > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread}</span>}
            </button>
            <button onClick={logout} className="text-slate-600 hover:text-slate-900">Log out</button>
            {open && (
              <div className="absolute right-0 top-8 z-10 max-h-80 w-80 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {notes?.length ? notes.map((n) => (
                  <Link key={n._id} href={n.url || '#'} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-slate-50">
                    <p className="font-medium">{n.title}</p><p className="text-xs text-slate-500">{n.body}</p>
                  </Link>
                )) : <p className="p-3 text-slate-500">No notifications</p>}
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl space-y-6 p-6">{children}</main>
      </div>
    </div>
  );
}
