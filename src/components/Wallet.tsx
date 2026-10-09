'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Field, Input, Pager, Select, Table, statusColor, useAction } from './ui';
import { LABELS } from '@/lib/constants';

type Method = { _id: string; name: string; minLimit: number; maxLimit: number; fixedCharge: number; percentCharge: number; instruction?: string; formFields: { label: string; key?: string; type: string; required: boolean }[] };

function MoneyForm({ kind, onDone }: { kind: 'deposit' | 'withdraw'; onDone: () => void }) {
  const { data: methods } = useApi<Method[]>(`/api/wallet/methods?kind=${kind}`);
  const [methodId, setMethodId] = useState(''); const [amount, setAmount] = useState(''); const [info, setInfo] = useState<Record<string, string>>({});
  const { busy, error, run } = useAction();
  const m = methods?.find((x) => x._id === methodId);
  const charge = m && Number(amount) ? m.fixedCharge + (Number(amount) * m.percentCharge) / 100 : 0;
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api(`/api/wallet/${kind}`, { body: { methodId, amount: Number(amount), info } }); setAmount(''); setInfo({}); onDone(); }); }}>
      <Field label="Method"><Select required value={methodId} onChange={(e) => { setMethodId(e.target.value); setInfo({}); }}><option value="">Select…</option>{methods?.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</Select></Field>
      {m && <>
        <Field label="Amount" hint={`Limit ${fmtMoney(m.minLimit)} – ${m.maxLimit ? fmtMoney(m.maxLimit) : 'no max'} · charge ${fmtMoney(charge)}`}><Input required type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        {m.instruction && <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{m.instruction}</p>}
        {m.formFields.map((f) => <Field key={f.label} label={f.label}><Input required={f.required} type={f.type === 'number' ? 'number' : 'text'} value={info[f.key || f.label] ?? ''} onChange={(e) => setInfo({ ...info, [f.key || f.label]: e.target.value })} /></Field>)}
      </>}
      <ErrorMsg>{error}</ErrorMsg>
      <Btn busy={busy} disabled={!m}>{kind === 'deposit' ? 'Submit deposit' : 'Request withdrawal'}</Btn>
    </form>
  );
}

export default function Wallet({ role }: { role: 'user' | 'buyer' }) {
  const [tab, setTab] = useState<'transactions' | 'deposits' | 'withdrawals'>('transactions');
  const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/wallet?type=${tab}&page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const tabs = role === 'buyer' ? (['transactions', 'deposits', 'withdrawals'] as const) : (['transactions', 'withdrawals'] as const);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card><p className="text-sm text-slate-500">Available balance</p><p className="text-4xl font-bold">{fmtMoney(data?.balance)}</p>{role === 'buyer' && <p className="mt-2 text-xs text-slate-500">Funds are held in escrow when you hire and released when you accept the work.</p>}</Card>
        <Card title={role === 'buyer' ? 'Add funds' : 'Withdraw'}><MoneyForm kind={role === 'buyer' ? 'deposit' : 'withdraw'} onDone={reload} /></Card>
      </div>
      {role === 'buyer' && <Card title="Withdraw funds"><MoneyForm kind="withdraw" onDone={reload} /></Card>}
      <Card>
        <div className="mb-4 flex gap-2">{tabs.map((t) => <Btn key={t} variant={tab === t ? 'primary' : 'ghost'} onClick={() => { setTab(t); setPage(1); }} className="capitalize">{t}</Btn>)}</div>
        {tab === 'transactions' ? (
          <Table head={['Date', 'Details', 'Amount', 'Balance', 'Trx']} empty={!data?.items.length}>
            {data?.items.map((t: any) => <tr key={t._id}><td>{fmtDate(t.createdAt)}</td><td>{t.details}</td><td className={t.trxType === '+' ? 'text-emerald-600' : 'text-red-600'}>{t.trxType}{fmtMoney(t.amount)}</td><td>{fmtMoney(t.postBalance)}</td><td className="font-mono text-xs">{t.trx}</td></tr>)} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          </Table>
        ) : (
          <Table head={['Date', 'Method', 'Amount', 'Charge', 'Status', 'Trx']} empty={!data?.items.length}>
            {data?.items.map((t: any) => <tr key={t._id}><td>{fmtDate(t.createdAt)}</td><td>{t.method?.name}</td><td>{fmtMoney(t.amount)}</td><td>{fmtMoney(t.charge)}</td><td><Badge color={statusColor.payment[t.status] as 'gray'}>{LABELS.payment[t.status]}</Badge>{t.adminFeedback && <p className="text-xs text-slate-500">{t.adminFeedback}</p>}</td><td className="font-mono text-xs">{t.trx}</td></tr>)} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
          </Table>
        )}
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </div>
  );
}
