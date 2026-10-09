'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Pager, Select, Table, statusColor, useAction } from '@/components/ui';
import { LABELS, S } from '@/lib/constants';

export default function Projects() {
  const [status, setStatus] = useState(String(S.PROJECT.REPORTED)); const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/admin/projects?page=${page}${status ? `&status=${status}` : ''}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  const resolve = (id: string, action: 'complete' | 'reject') => { if (confirm(action === 'complete' ? 'Pay the freelancer and complete this project?' : 'Reject the project and refund the client escrow?')) run(async () => { await api(`/api/admin/projects/${id}`, { body: { action } }); reload(); }); };
  return (
    <>
      <h1 className="text-2xl font-bold">Projects</h1>
      <Card actions={<Select className="!w-40" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All</option>{Object.entries(LABELS.project).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}>
        <ErrorMsg>{error}</ErrorMsg>
        <Table head={['Job', 'Freelancer', 'Client', 'Amount', 'Status', 'Updated', '']} empty={data && !data.items.length}>
          {data?.items.map((p: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <tr key={p._id}><td className="font-medium">{p.job?.title}{p.reportReason && <p className="max-w-xs text-xs font-normal text-amber-700">Report: {p.reportReason}</p>}</td><td>{p.user?.username}</td><td>{p.buyer?.username}</td><td>{fmtMoney(p.bid?.bidAmount)}</td>
              <td><Badge color={statusColor.project[p.status] as 'gray'}>{LABELS.project[p.status]}</Badge></td><td>{fmtDate(p.updatedAt)}</td>
              <td className="space-x-1 text-right">{p.projectFile && <a className="text-indigo-600" href={`/api/files/project/${p._id}`}>File</a>}{p.status === S.PROJECT.REPORTED && <><Btn variant="success" className="!px-2 !py-1 text-xs" onClick={() => resolve(p._id, 'complete')}>Pay freelancer</Btn><Btn variant="danger" className="!px-2 !py-1 text-xs" onClick={() => resolve(p._id, 'reject')}>Refund client</Btn></>}</td></tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </>
  );
}
