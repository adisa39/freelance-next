'use client';
import { useState } from 'react';
import { api } from '@/lib/client';

export default function ContactForm({ signedIn }: { signedIn: boolean }) {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  void signedIn;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await api('/api/contact', { body: f }); setMsg({ ok: true, t: 'Ticket created successfully!' }); setF({ name: '', email: '', subject: '', message: '' }); } catch (err) { setMsg({ ok: false, t: (err as Error).message }); } finally { setBusy(false); } }}>
      <div className="row">
        <div className="col-sm-6 form-group"><label className="form--label" htmlFor="name">Name</label><input id="name" name="name" type="text" className="form-control form--control" value={f.name} onChange={set('name')} required /></div>
        <div className="col-sm-6 form-group"><label className="form--label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="form-control form--control" value={f.email} onChange={set('email')} required /></div>
        <div className="col-sm-12 form-group"><label className="form--label" htmlFor="subject">Subject</label><input id="subject" name="subject" type="text" className="form-control form--control" value={f.subject} onChange={set('subject')} required /></div>
        <div className="col-sm-12 form-group"><label className="form--label" htmlFor="message">Message</label><textarea id="message" name="message" className="form-control form--control" value={f.message} onChange={set('message')} required /></div>
        {msg && <p className={msg.ok ? 'text-success' : 'text-danger'}>{msg.t}</p>}
        <div className="form-group"><button type="submit" className="btn btn--base w-100" disabled={busy}>Send Message</button></div>
      </div>
    </form>
  );
}
