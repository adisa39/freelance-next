'use client';
import { useState } from 'react';
import { api, fmtDate, useApi } from '@/lib/client';
import { Badge, Btn, Card, Table, Textarea, useAction, ErrorMsg } from '@/components/ui';

export default function AdminTickets() {
  const { data, reload } = useApi<any>('/api/admin/tickets'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [open, setOpen] = useState<any>(null); const [msg, setMsg] = useState(''); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  const send = (body: object) => run(async () => { const t = await api('/api/admin/tickets', { body: { id: open._id, ...body } }); setOpen(t); setMsg(''); reload(); });
  return (
    <>
      <h1 className="text-2xl font-bold">Support tickets</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card><Table head={['Subject', 'From', 'Status', 'Date']} empty={data && !data.items.length}>
          {data?.items.map((t: any) => <tr key={t._id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(t)}><td>{t.subject}</td><td>{t.ownerRole}</td><td><Badge color={t.status === 3 ? 'gray' : 'blue'}>{['Open', 'Answered', 'Customer reply', 'Closed'][t.status]}</Badge></td><td>{fmtDate(t.createdAt)}</td></tr>)} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
        </Table></Card>
        {open && <Card title={open.subject} actions={open.status !== 3 && <Btn variant="ghost" onClick={() => send({ close: true })}>Close</Btn>}>
          <div className="space-y-2">{open.messages.map((m: any, i: number) => <div key={i} className={`rounded-lg p-3 text-sm ${m.senderRole === 'admin' ? 'bg-indigo-50' : 'bg-slate-50'}`}><p className="text-xs text-slate-500">{m.senderRole} · {fmtDate(m.createdAt)}</p>{m.message}</div>)}</div> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          {open.status !== 3 && <div className="mt-3 space-y-2"><Textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} /><ErrorMsg>{error}</ErrorMsg><Btn disabled={!msg.trim()} onClick={() => send({ message: msg })}>Reply</Btn></div>}
        </Card>}
      </div>
    </>
  );
}
