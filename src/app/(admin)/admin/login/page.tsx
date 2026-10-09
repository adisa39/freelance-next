'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client';
import { Btn, Card, ErrorMsg, Field, Input, useAction } from '@/components/ui';

export default function AdminLogin() {
  const router = useRouter();
  const [f, setF] = useState({ login: '', password: '' });
  const { busy, error, run } = useAction();
  return (
    <main className="mx-auto mt-24 max-w-sm px-4">
      <Card title="Admin sign in">
        <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/api/auth/login', { body: { role: 'admin', ...f } }); router.push('/admin'); router.refresh(); }); }} className="space-y-4">
          <Field label="Username or email"><Input required value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} /></Field>
          <Field label="Password"><Input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          <ErrorMsg>{error}</ErrorMsg><Btn className="w-full" busy={busy}>Sign in</Btn>
        </form>
      </Card>
    </main>
  );
}
