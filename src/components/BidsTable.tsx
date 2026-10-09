'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fmtDate, fmtMoney, fullName, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Pager, Table, statusColor, useAction } from './ui';
import { LABELS, S } from '@/lib/constants';

/** Buyer view of bids (for one job or all jobs) with shortlist / chat / hire actions. */
export default function BidsTable({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1); const [sort, setSort] = useState('createdAt');
  const { data, reload } = useApi<any>(`/api/buyer/bids?page=${page}&sort=${sort}${jobId ? `&job=${jobId}` : ''}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { busy, error, run } = useAction();
  return (
    <Card title="Bids" actions={<select className="rounded-lg border border-slate-300 px-2 py-1 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}><option value="createdAt">Newest</option><option value="isShortlist">Shortlisted first</option><option value="updatedAt">Recently updated</option></select>}>
      <ErrorMsg>{error}</ErrorMsg>
      <Table head={['Freelancer', 'Job', 'Amount', 'Time', 'Status', 'Actions']} empty={!data?.items.length}>
        {data?.items.map((b: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
          <tr key={b._id}>
            <td><p className="font-medium">{fullName(b.user)}</p><p className="text-xs text-slate-500">{b.user?.tagline} · ★ {b.user?.avgRating?.toFixed(1)}</p></td>
            <td>{b.job?.title}</td><td>{fmtMoney(b.bidAmount)}</td><td>{b.estimatedTime}<p className="text-xs text-slate-500">{fmtDate(b.createdAt)}</p></td>
            <td><Badge color={statusColor.bid[b.status] as 'gray'}>{LABELS.bid[b.status]}</Badge></td>
            <td>
              <details className="mb-1"><summary className="cursor-pointer text-xs text-indigo-600">Cover letter</summary><p className="mt-1 max-w-xs whitespace-pre-wrap text-xs text-slate-600">{b.bidQuote}</p></details>
              <div className="flex flex-wrap gap-1.5">
                <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => run(async () => { await api(`/api/buyer/bids/${b._id}/shortlist`, { body: {} }); reload(); })}>{b.isShortlist ? '★' : '☆'}</Btn>
                <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => run(async () => { const c = await api(`/api/conversations`, { body: { bidId: b._id } }); router.push(`/buyer/messages?c=${c._id}`); })}>Chat</Btn>
                {b.status === S.BID.PENDING && <Btn variant="success" busy={busy} className="!px-2 !py-1 text-xs" onClick={() => { if (confirm(`Hire for ${fmtMoney(b.bidAmount)}? Funds will be held in escrow.`)) run(async () => { await api(`/api/buyer/bids/${b._id}/hire`, { body: {} }); reload(); }); }}>Hire</Btn>}
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {data && <Pager page={data.page} pages={data.pages} onPage={setPage} />}
    </Card>
  );
}
