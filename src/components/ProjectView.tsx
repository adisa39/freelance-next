'use client';
import { useState } from 'react';
import { api, fmtDate, fmtMoney, fullName, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Field, Loading, Select, Textarea, statusColor, useAction } from './ui';
import { LABELS, S } from '@/lib/constants';

function RateForm({ initial, submitLabel, onSubmit }: { initial?: { rating: number; review: string }; submitLabel: string; onSubmit: (v: { rating: number; review: string }) => Promise<void> }) {
  const [rating, setRating] = useState(String(initial?.rating ?? 5)); const [review, setReview] = useState(initial?.review ?? '');
  const { busy, error, run } = useAction();
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => onSubmit({ rating: Number(rating), review })); }}>
      <Field label="Rating"><Select value={rating} onChange={(e) => setRating(e.target.value)}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</Select></Field>
      <Field label="Review"><Textarea required value={review} onChange={(e) => setReview(e.target.value)} /></Field>
      <ErrorMsg>{error}</ErrorMsg><Btn busy={busy}>{submitLabel}</Btn>
    </form>
  );
}

export default function ProjectView({ id, role }: { id: string; role: 'user' | 'buyer' }) {
  const base = role === 'buyer' ? 'buyer' : 'freelancer';
  const { data: p, reload } = useApi<any>(`/api/${base}/projects/${id}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [reason, setReason] = useState(''); const [file, setFile] = useState<File | null>(null); const [comments, setComments] = useState('');
  const act = useAction();
  if (!p) return <Loading />;
  const other = role === 'buyer' ? p.user : p.buyer;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-6 md:col-span-2">
        <Card title={p.job?.title} actions={<Badge color={statusColor.project[p.status] as 'gray'}>{LABELS.project[p.status]}</Badge>}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-slate-500">{role === 'buyer' ? 'Freelancer' : 'Client'}</dt><dd className="font-medium">{fullName(other)}</dd></div>
            <div><dt className="text-slate-500">Amount</dt><dd className="font-medium">{fmtMoney(p.bid?.bidAmount)}{p.escrowAmount > 0 && <span className="ml-2 text-xs text-emerald-600">in escrow</span>}</dd></div>
            <div><dt className="text-slate-500">Estimated time</dt><dd>{p.bid?.estimatedTime}</dd></div>
            <div><dt className="text-slate-500">Last delivery</dt><dd>{fmtDate(p.uploadedAt)} ({p.uploadCount || 0} uploads)</dd></div>
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{p.job?.description}</p>
        </Card>
        {p.projectFile && (
          <Card title="Delivered work">
            <a className="text-indigo-600 underline" href={`/api/files/project/${p._id}`}>Download file</a>
            {p.comments && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{p.comments}</p>}
          </Card>
        )}
        {p.reportReason && <Card title="Reported"><p className="text-sm">{p.reportReason}</p></Card>}
        {(p.review || p.buyerReview) && (
          <Card title="Reviews">
            {p.review && <p className="text-sm"><b>Client → freelancer:</b> {'★'.repeat(p.review.rating)} {p.review.review}</p>}
            {p.buyerReview && <p className="mt-2 text-sm"><b>Freelancer → client:</b> {'★'.repeat(p.buyerReview.rating)} {p.buyerReview.review}</p>}
          </Card>
        )}
      </div>
      <div className="space-y-6">
        {role === 'user' && (p.status === S.PROJECT.RUNNING || p.status === S.PROJECT.BUYER_REVIEW) && (
          <Card title={p.status === S.PROJECT.RUNNING ? 'Deliver work' : 'Upload a new version'}>
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); act.run(async () => { const f = new FormData(); f.set('project_file', file!); f.set('comments', comments); await api(`/api/freelancer/projects/${id}/upload`, { body: f }); setFile(null); reload(); }); }}>
              <Field label="File" hint="zip, rar, 7z, pdf, doc(x), xls(x)"><input required type="file" accept=".zip,.rar,.7z,.pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm" /></Field>
              <Field label="Comments"><Textarea value={comments} onChange={(e) => setComments(e.target.value)} /></Field>
              <ErrorMsg>{act.error}</ErrorMsg><Btn busy={act.busy} disabled={!file}>Submit for review</Btn>
            </form>
          </Card>
        )}
        {role === 'user' && p.status === S.PROJECT.COMPLETED && (
          <Card title={p.buyerReview ? 'Update your review of the client' : 'Rate the client'}>
            <RateForm initial={p.buyerReview} submitLabel="Save review" onSubmit={async (v) => { await api(`/api/freelancer/projects/${id}/review`, { body: v }); reload(); }} />
          </Card>
        )}
        {role === 'buyer' && p.status === S.PROJECT.BUYER_REVIEW && (
          <>
            <Card title="Accept & pay"><p className="mb-3 text-sm text-slate-500">Releases {fmtMoney(p.bid?.bidAmount)} to the freelancer.</p>
              <RateForm submitLabel="Complete project" onSubmit={async (v) => { await api(`/api/buyer/projects/${id}/complete`, { body: v }); reload(); }} />
            </Card>
            <Card title="Report a problem">
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); act.run(async () => { await api(`/api/buyer/projects/${id}/report`, { body: { report_reason: reason } }); reload(); }); }}>
                <Textarea required placeholder="What's wrong with the delivery?" value={reason} onChange={(e) => setReason(e.target.value)} />
                <ErrorMsg>{act.error}</ErrorMsg><Btn variant="danger" busy={act.busy}>Report to admin</Btn>
              </form>
            </Card>
          </>
        )}
        {role === 'buyer' && p.status === S.PROJECT.COMPLETED && p.review && (
          <Card title="Edit your review"><RateForm initial={p.review} submitLabel="Update" onSubmit={async (v) => { await api(`/api/buyer/projects/${id}/review`, { method: 'PUT', body: v }); reload(); }} /></Card>
        )}
      </div>
    </div>
  );
}
