'use client';
import { useState } from 'react';
import { api, fmtDate, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Field, Input, Table, Textarea, useAction } from './ui';
import { S } from '@/lib/constants';

const statusName = ['Open', 'Answered', 'Customer reply', 'Closed'];

export default function Tickets() {
  const { data, reload } = useApi<{ items: any[] }>('/api/tickets'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [open, setOpen] = useState<string | null>(null);
  const { data: t, reload: reloadT } = useApi<any>(open ? `/api/tickets/${open}` : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [f, setF] = useState({ subject: '', message: '', priority: '2' }); const [reply, setReply] = useState('');
  const { busy, error, run } = useAction();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card title="Open a ticket">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/api/tickets', { body: { ...f, priority: Number(f.priority) } }); setF({ subject: '', message: '', priority: '2' }); reload(); }); }}>
            <Field label="Subject"><Input required value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
            <Field label="Message"><Textarea required value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
            <ErrorMsg>{error}</ErrorMsg><Btn busy={busy}>Submit</Btn>
          </form>
        </Card>
        <Card title="My tickets">
          <Table head={['Subject', 'Status', 'Date']} empty={!data?.items.length}>
            {data?.items.map((x) => <tr key={x._id} className="cursor-pointer hover:bg-slate-50" onClick={() => setOpen(x._id)}><td>{x.subject}</td><td><Badge color={x.status === S.TICKET.CLOSE ? 'gray' : 'blue'}>{statusName[x.status]}</Badge></td><td>{fmtDate(x.createdAt)}</td></tr>)}
          </Table>
        </Card>
      </div>
      {t && (
        <Card title={t.subject} actions={t.status !== S.TICKET.CLOSE && <Btn variant="ghost" onClick={async () => { await api(`/api/tickets/${open}`, { body: { close: true } }); reloadT(); reload(); }}>Close</Btn>}>
          <div className="space-y-3">{t.messages.map((m: any, i: number) => <div key={i} className={`rounded-lg p-3 text-sm ${m.senderRole === 'admin' ? 'bg-indigo-50' : 'bg-slate-50'}`}><p className="text-xs text-slate-500">{m.senderRole === 'admin' ? 'Support' : 'You'} · {fmtDate(m.createdAt)}</p><p className="whitespace-pre-wrap">{m.message}</p></div>)}</div> {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          {t.status !== S.TICKET.CLOSE && (
            <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await api(`/api/tickets/${open}`, { body: { message: reply } }); setReply(''); reloadT(); reload(); }); }}>
              <Textarea required rows={3} value={reply} onChange={(e) => setReply(e.target.value)} /><Btn busy={busy}>Reply</Btn>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
