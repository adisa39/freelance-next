'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Pager, Table, statusColor, useAction } from '@/components/ui';
import { LABELS, S } from '@/lib/constants';

export default function Bids() {
  const [page, setPage] = useState(1);
  const { data, reload } = useApi<any>(`/api/freelancer/bids?page=${page}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { error, run } = useAction();
  return (
    <>
      <h1 className="text-2xl font-bold">My bids</h1>
      <Card><ErrorMsg>{error}</ErrorMsg>
        <Table head={['Job', 'Amount', 'Time', 'Status', 'Placed', '']} empty={data && !data.items.length}>
          {data?.items.map((b: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <tr key={b._id}><td className="font-medium">{b.job ? <Link className="hover:text-indigo-600" href={`/explore-job/${b.job.slug}`}>{b.job.title}</Link> : '—'}</td><td>{fmtMoney(b.bidAmount)}</td><td>{b.estimatedTime}</td>
              <td><Badge color={statusColor.bid[b.status] as 'gray'}>{LABELS.bid[b.status]}</Badge></td><td>{fmtDate(b.createdAt)}</td>
              <td className="text-right">{b.status === S.BID.PENDING && <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => run(async () => { await api(`/api/freelancer/bids/${b._id}/withdraw`, { body: {} }); reload(); })}>Withdraw</Btn>}{b.project && <Link className="text-indigo-600" href={`/freelancer/projects/${b.project}`}>Project</Link>}</td></tr>
          ))}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
      </Card>
    </>
  );
}
