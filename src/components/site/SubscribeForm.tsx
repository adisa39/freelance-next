'use client';
import { useState } from 'react';
import { api } from '@/lib/client';

export default function SubscribeForm() {
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  return (
    <form className="subscribe-form" onSubmit={async (e) => { e.preventDefault(); try { await api('/api/subscribe', { body: { email } }); setMsg({ ok: true, t: 'You have successfully subscribed to our newsletter' }); setEmail(''); } catch (err) { setMsg({ ok: false, t: (err as Error).message }); } }}>
      <div className="input-group">
        <input type="email" className="form-control form--control h-50" required name="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="input-group-text input-text-style"><i className="fa-regular fa-paper-plane" /></button>
      </div>
      {msg && <small className={`d-block mt-2 ${msg.ok ? 'text-success' : 'text-danger'}`}>{msg.t}</small>}
    </form>
  );
}
