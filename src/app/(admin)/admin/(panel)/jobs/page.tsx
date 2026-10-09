'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Btn, Card, Pager, Select, Table, statusColor, useAction, ErrorMsg } from '@/components/ui';
import { LABELS } from '@/lib/constants';

export default function Jobs() {
  const [scope, setScope] = useState('pending'); const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/admin/jobs?scope=${scope}&page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  return (
    <>
      <h1 className="text-2xl font-bold">Jobs</h1>
      <Card actions={<Select className="!w-44" value={scope} onChange={(e) => { setScope(e.target.value); setPage(1); }}>{['pending', 'approved', 'rejected', 'published', 'drafted', 'processing', 'completed', ''].map((s) => <option key={s} value={s}>{s || 'all'}</option>)}</Select>}>
        <ErrorMsg>{error}</ErrorMsg>
        <Table head={['Title', 'Client', 'Category', 'Budget', 'Status', 'Posted', '']} empty={data && !data.items.length}>
          {data?.items.map((j: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <tr key={j._id}><td className="font-medium">{j.title}</td><td>{j.buyer?.username}</td><td>{j.category?.name}</td><td>{fmtMoney(j.budget)}</td>
              <td><Badge color="blue">{LABELS.job[j.status]}</Badge> <Badge color={statusColor.approval[j.isApproved] as 'gray'}>{LABELS.approval[j.isApproved]}</Badge></td><td>{fmtDate(j.createdAt)}</td>
              <td className="space-x-1 text-right">{j.isApproved !== 1 && <Btn variant="success" className="!px-2 !py-1 text-xs" onClick={() => run(async () => { await api(`/api/admin/jobs/${j._id}`, { body: { action: 'approve' } }); reload(); })}>Approve</Btn>}{j.isApproved !== 3 && <Btn variant="danger" className="!px-2 !py-1 text-xs" onClick={() => run(async () => { await api(`/api/admin/jobs/${j._id}`, { body: { action: 'reject' } }); reload(); })}>Reject</Btn>}</td></tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </>
  );
}
