'use client';
import { useEffect, useState } from 'react';
import { api, useApi } from '@/lib/client';
import { Btn, Card, ErrorMsg, Field, Input, Select, Table, useAction } from '@/components/ui';

type Col = { key: string; label: string; type?: 'text' | 'number' | 'select' };

/** Minimal CRUD table over /api/admin/resources/[name]. */
function Resource({ name, title, cols, extra }: { name: string; title: string; cols: Col[]; extra?: Record<string, unknown> }) {
  const { data, reload } = useApi<any[]>(`/api/admin/resources/${name}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: cats } = useApi<{ categories: { _id: string; name: string }[] }>(name === 'subcategories' ? '/api/catalog' : null);
  const [f, setF] = useState<Record<string, string>>({});
  const { error, run } = useAction();
  return (
    <Card title={title}>
      <form className="mb-4 flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await api(`/api/admin/resources/${name}`, { body: { ...f, ...extra } }); setF({}); reload(); }); }}>
        {cols.map((c) => c.type === 'select'
          ? <Field key={c.key} label={c.label}><Select required value={f[c.key] ?? ''} onChange={(e) => setF({ ...f, [c.key]: e.target.value })}><option value="">Select…</option>{cats?.categories.map((x) => <option key={x._id} value={x._id}>{x.name}</option>)}</Select></Field>
          : <Field key={c.key} label={c.label}><Input required type={c.type ?? 'text'} step="any" value={f[c.key] ?? ''} onChange={(e) => setF({ ...f, [c.key]: e.target.value })} /></Field>)}
        <Btn>Add</Btn>
      </form>
      <ErrorMsg>{error}</ErrorMsg>
      <Table head={[...cols.map((c) => c.label), '']} empty={!!data && !data.length}>
        {data?.map((r) => <tr key={r._id}>{cols.map((c) => <td key={c.key}>{String(r[c.key] ?? '')}</td>)}<td className="text-right"><Btn variant="danger" className="!px-2 !py-1 text-xs" onClick={() => confirm('Delete?') && run(async () => { await api(`/api/admin/resources/${name}/${r._id}`, { method: 'DELETE' }); reload(); })}>Delete</Btn></td></tr>)}
      </Table>
    </Card>
  );
}

const methodCols: Col[] = [{ key: 'name', label: 'Name' }, { key: 'minLimit', label: 'Min', type: 'number' }, { key: 'maxLimit', label: 'Max', type: 'number' }, { key: 'fixedCharge', label: 'Fixed fee', type: 'number' }, { key: 'percentCharge', label: '% fee', type: 'number' }, { key: 'instruction', label: 'Instruction' }];

export default function Settings() {
  const { data } = useApi<any>('/api/admin/settings'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [s, setS] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [saved, setSaved] = useState(false);
  const { error, run } = useAction();
  useEffect(() => { if (data) setS(data); }, [data]);
  const flag = (k: string, label: string) => <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!s?.[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />{label}</label>;
  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>
      {s && <Card title="General">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run(async () => { await api('/api/admin/settings', { method: 'PUT', body: { siteName: s.siteName, curText: s.curText, curSym: s.curSym, escrowPayment: s.escrowPayment, percentServiceCharge: s.percentServiceCharge, fixedServiceCharge: Number(s.fixedServiceCharge), jobAutoApproved: s.jobAutoApproved, registration: s.registration, buyerRegistration: s.buyerRegistration } }); setSaved(true); }); }}>
          <div className="grid gap-4 md:grid-cols-4"><Field label="Site name"><Input value={s.siteName} onChange={(e) => setS({ ...s, siteName: e.target.value })} /></Field><Field label="Currency"><Input value={s.curText} onChange={(e) => setS({ ...s, curText: e.target.value })} /></Field><Field label="Symbol"><Input value={s.curSym} onChange={(e) => setS({ ...s, curSym: e.target.value })} /></Field><Field label="Fixed service charge"><Input type="number" step="0.01" value={s.fixedServiceCharge} onChange={(e) => setS({ ...s, fixedServiceCharge: e.target.value })} /></Field></div>
          <div className="grid gap-2 md:grid-cols-3">{flag('escrowPayment', 'Hold funds in escrow on hire')}{flag('percentServiceCharge', 'Apply % service charge tiers')}{flag('jobAutoApproved', 'Auto-approve published jobs')}{flag('registration', 'Freelancer registration open')}{flag('buyerRegistration', 'Client registration open')}</div>
          <ErrorMsg>{error}</ErrorMsg>{saved && <p className="text-sm text-emerald-600">Saved.</p>}<Btn>Save</Btn>
        </form>
      </Card>}
      <Resource name="categories" title="Categories" cols={[{ key: 'name', label: 'Name' }]} />
      <Resource name="subcategories" title="Subcategories" cols={[{ key: 'category', label: 'Category', type: 'select' }, { key: 'name', label: 'Name' }]} />
      <Resource name="skills" title="Skills" cols={[{ key: 'name', label: 'Name' }]} />
      <Resource name="charges" title="Service charge tiers (applies when freelancer earnings ≤ amount)" cols={[{ key: 'amount', label: 'Earnings up to', type: 'number' }, { key: 'percent', label: 'Percent', type: 'number' }]} />
      <Resource name="badges" title="Freelancer badges" cols={[{ key: 'badgeName', label: 'Name' }, { key: 'minAmount', label: 'Min earnings', type: 'number' }]} />
      <Resource name="deposit-methods" title="Deposit methods (manual)" cols={methodCols} />
      <Resource name="withdraw-methods" title="Withdraw methods" cols={methodCols} />
    </>
  );
}
