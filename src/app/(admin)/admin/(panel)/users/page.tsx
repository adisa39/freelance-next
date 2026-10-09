'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, fullName, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Input, Pager, Select, Table, useAction } from '@/components/ui';

export default function Users() {
  const [role, setRole] = useState('user'); const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/admin/users?role=${role}&q=${encodeURIComponent(q)}&page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  const post = (id: string, body: object) => run(async () => { await api(`/api/admin/users/${role}/${id}`, { body }); reload(); });
  return (
    <>
      <h1 className="text-2xl font-bold">Users</h1>
      <Card actions={<><Input placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="!w-48" /><Select className="!w-36" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}><option value="user">Freelancers</option><option value="buyer">Clients</option></Select></>}>
        <ErrorMsg>{error}</ErrorMsg>
        <Table head={['Name', 'Email', 'Balance', 'Rating', 'Joined', 'Status', '']} empty={data && !data.items.length}>
          {data?.items.map((u: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <tr key={u._id}><td className="font-medium">{fullName(u)}<p className="text-xs font-normal text-slate-500">@{u.username}</p></td><td>{u.email}</td><td>{fmtMoney(u.balance)}</td><td>{u.avgRating?.toFixed(1)}</td><td>{fmtDate(u.createdAt)}</td>
              <td><Badge color={u.status === 1 ? 'green' : 'red'}>{u.status === 1 ? 'Active' : 'Banned'}</Badge></td>
              <td className="space-x-1 text-right">
                <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => { const a = prompt('Amount'); const t = a && confirm('OK = add to balance, Cancel = subtract') ? 'add' : 'sub'; if (a) post(u._id, { action: 'balance', amount: Number(a), type: t }); }}>Balance</Btn>
                {u.status === 1 ? <Btn variant="danger" className="!px-2 !py-1 text-xs" onClick={() => post(u._id, { action: 'ban', reason: prompt('Reason') ?? undefined })}>Ban</Btn> : <Btn variant="success" className="!px-2 !py-1 text-xs" onClick={() => post(u._id, { action: 'unban' })}>Unban</Btn>}
              </td></tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </>
  );
}
