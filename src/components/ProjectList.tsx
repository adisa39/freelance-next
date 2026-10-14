'use client';
import Link from 'next/link';
import { useState } from 'react';
import { fmtDate, fmtMoney, fullName, useApi } from '@/lib/client';
import { Badge, Card, Pager, Select, Table, statusColor } from './ui';
import { LABELS } from '@/lib/constants';

export default function ProjectList({ role }: { role: 'user' | 'buyer' }) {
  const [page, setPage] = useState(1); const [status, setStatus] = useState('');
  const apiBase = role === 'buyer' ? 'client' : 'freelancer';
  const pageBase = role === 'buyer' ? 'client' : 'freelancer';
  const { data } = useApi<any>(`/api/${apiBase}/projects?page=${page}${status ? `&status=${status}` : ''}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <Card actions={<Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="!w-40"><option value="">All statuses</option>{Object.entries(LABELS.project).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select>}>
      <Table head={['Job', role === 'buyer' ? 'Freelancer' : 'Client', 'Amount', 'Status', 'Updated', '']} empty={data && !data.items.length}>
        {data?.items.map((p: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <tr key={p._id}><td className="font-medium">{p.job?.title}</td><td>{fullName(role === 'buyer' ? p.user : p.buyer)}</td><td>{fmtMoney(p.bid?.bidAmount)}</td>
            <td><Badge color={statusColor.project[p.status] as 'gray'}>{LABELS.project[p.status]}</Badge></td><td>{fmtDate(p.updatedAt)}</td>
            <td className="text-right"><Link className="text-indigo-600" href={`/${pageBase}/projects/${p._id}`}>Open</Link></td></tr>
        ))}
      </Table>
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </Card>
  );
}
