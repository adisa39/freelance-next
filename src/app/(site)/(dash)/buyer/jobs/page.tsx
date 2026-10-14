'use client';
import Link from 'next/link';
import { useState } from 'react';
import { fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Card, Pager, Table, statusColor } from '@/components/ui';
import { LABELS } from '@/lib/constants';

export default function Jobs() {
  const [page, setPage] = useState(1);
  const { data } = useApi<any>(`/api/client/jobs?page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">My jobs</h1><Link href="/client/jobs/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Post a job</Link></div>
      <Card>
        <Table head={['Title', 'Category', 'Budget', 'Bids', 'Status', 'Review', '']} empty={data && !data.items.length}>
          {data?.items.map((j: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <tr key={j._id}><td className="font-medium">{j.title}<p className="text-xs font-normal text-slate-500">{fmtDate(j.createdAt)}</p></td><td>{j.category?.name}</td><td>{fmtMoney(j.budget)}</td><td>{j.bidsCount}</td>
              <td><Badge color="blue">{LABELS.job[j.status]}</Badge></td><td><Badge color={statusColor.approval[j.isApproved] as 'gray'}>{LABELS.approval[j.isApproved]}</Badge></td>
              <td className="space-x-3 text-right"><Link className="text-indigo-600" href={`/client/jobs/${j._id}/bids`}>Bids</Link>{j.isApproved === 0 && <Link className="text-indigo-600" href={`/client/jobs/${j._id}`}>Edit</Link>}</td></tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </>
  );
}
