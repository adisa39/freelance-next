'use client';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, fmtDate, fullName, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Input, useAction } from './ui';

type Msg = { _id: string; senderRole: string; message: string; files: string[]; createdAt: string };

export default function Messages({ role }: { role: 'user' | 'buyer' }) {
  const sp = useSearchParams();
  const { data: convos, reload } = useApi<any[]>('/api/conversations'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [active, setActive] = useState<string | null>(sp.get('c'));
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const { busy, error, run } = useAction();
  const bottom = useRef<HTMLDivElement>(null);
  const last = useRef<string | undefined>(undefined);

  useEffect(() => { if (!active && convos?.length) setActive(convos[0]._id); }, [convos, active]);

  // Poll for new messages every 4s (swap for SSE / Pusher / Ably if you need true realtime)
  useEffect(() => {
    if (!active) return;
    let stop = false; setMsgs([]); last.current = undefined;
    const tick = async () => {
      try {
        const r = await api<{ items: Msg[]; blocked: boolean }>(`/api/conversations/${active}/messages${last.current ? `?after=${encodeURIComponent(last.current)}` : ''}`);
        if (stop) return;
        setBlocked(r.blocked);
        if (r.items.length) { last.current = r.items[r.items.length - 1].createdAt; setMsgs((m) => [...m, ...r.items]); }
      } catch { /* ignore transient errors */ }
    };
    tick(); const t = setInterval(tick, 4000);
    return () => { stop = true; clearInterval(t); };
  }, [active]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      let body: FormData | { message: string };
      if (files?.length) { const f = new FormData(); f.set('message', text); Array.from(files).forEach((x) => f.append('files', x)); body = f; } else body = { message: text };
      const m = await api<Msg>(`/api/conversations/${active}/messages`, { body });
      setMsgs((x) => (x.some((y) => y._id === m._id) ? x : [...x, m])); last.current = m.createdAt; setText(''); setFiles(null); reload();
    });
  };
  const cur = convos?.find((c) => c._id === active);

  return (
    <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
      <Card className="max-h-[70vh] overflow-auto !p-2">
        {convos?.map((c) => {
          const other = role === 'user' ? c.buyer : c.user;
          return (
            <button key={c._id} onClick={() => setActive(c._id)} className={`block w-full rounded-lg px-3 py-2.5 text-left ${active === c._id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center justify-between"><span className="font-medium">{fullName(other)}</span>{c.unread > 0 && <Badge color="red">{c.unread}</Badge>}</div>
              <p className="truncate text-xs text-slate-500">{c.lastMessage ?? 'No messages yet'}</p>
            </button>
          );
        })}
        {convos && !convos.length && <p className="p-4 text-sm text-slate-500">No conversations yet.</p>}
      </Card>
      <Card className="flex h-[70vh] flex-col !p-0">
        {cur ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div><p className="font-medium">{fullName(role === 'user' ? cur.buyer : cur.user)}</p>{cur.job?.title && <p className="text-xs text-slate-500">{cur.job.title}</p>}</div>
              {role === 'buyer' && <Btn variant="ghost" onClick={async () => { const r = await api<{ blocked: boolean }>(`/api/conversations/${active}/block`, { body: {} }); setBlocked(r.blocked); }}>{blocked ? 'Unblock' : 'Block'}</Btn>}
            </div>
            <div className="flex-1 space-y-3 overflow-auto p-4">
              {msgs.map((m) => (
                <div key={m._id} className={`flex ${m.senderRole === role ? 'justify-end' : ''}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.senderRole === role ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>
                    {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
                    {m.files?.map((_, i) => <a key={i} href={`/api/files/message/${m._id}/${i}`} className="mt-1 block text-xs underline">📎 Attachment {i + 1}</a>)}
                    <p className="mt-1 text-[10px] opacity-70">{fmtDate(m.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="space-y-2 border-t border-slate-200 p-3">
              <ErrorMsg>{error}</ErrorMsg>
              {blocked ? <p className="text-center text-sm text-slate-500">This conversation is blocked.</p> : (
                <div className="flex gap-2">
                  <Input placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} />
                  <label className="flex cursor-pointer items-center rounded-lg border border-slate-300 px-3 text-sm">{files?.length ? `${files.length} 📎` : '📎'}<input type="file" multiple hidden accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={(e) => setFiles(e.target.files)} /></label>
                  <Btn busy={busy} disabled={!text.trim() && !files?.length}>Send</Btn>
                </div>
              )}
            </form>
          </>
        ) : <p className="m-auto text-sm text-slate-500">Select a conversation</p>}
      </Card>
    </div>
  );
}
