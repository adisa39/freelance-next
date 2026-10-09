'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Pager, Select, Table, statusColor, useAction } from './ui';
import { LABELS } from '@/lib/constants';

/** Admin queue for deposits or withdrawals: approve / reject with feedback. */
export default function ReviewQueue({ kind }: { kind: 'deposits' | 'withdrawals' }) {
  const [status, setStatus] = useState('2'); const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/admin/${kind}?status=${status}&page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  const act = (id: string, action: 'approve' | 'reject') => { const feedback = prompt(`Feedback for the user (optional)`) ?? undefined; run(async () => { await api(`/api/admin/${kind}/${id}`, { body: { action, feedback } }); reload(); }); };
  return (
    <Card actions={<Select className="!w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>{[['2', 'Pending'], ['1', 'Approved'], ['3', 'Rejected']].map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}>
      <ErrorMsg>{error}</ErrorMsg>
      <Table head={['User', 'Method', 'Amount', 'Charge', 'Details', 'Status', 'Date', '']} empty={data && !data.items.length}>
        {data?.items.map((d: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <tr key={d._id}><td>{(d.buyer ?? d.user)?.username}</td><td>{d.method?.name}</td><td>{fmtMoney(d.amount)}</td><td>{fmtMoney(d.charge)}</td>
            <td className="max-w-xs text-xs text-slate-600">{Object.entries((d.detail ?? d.info ?? {}) as Record<string, string>).map(([k, v]) => <div key={k}><b>{k}:</b> {v}</div>)}</td>
            <td><Badge color={statusColor.payment[d.status] as 'gray'}>{LABELS.payment[d.status]}</Badge></td><td>{fmtDate(d.createdAt)}</td>
            <td className="space-x-1 text-right">{d.status === 2 && <><Btn variant="success" className="!px-2 !py-1 text-xs" onClick={() => act(d._id, 'approve')}>Approve</Btn><Btn variant="danger" className="!px-2 !py-1 text-xs" onClick={() => act(d._id, 'reject')}>Reject</Btn></>}</td></tr>
        ))}
      </Table>
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </Card>
  );
}
