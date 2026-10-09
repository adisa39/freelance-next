'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/client';
import BidderCard, { type Bidder } from './BidderCard';

/** Bid modal trigger + "load more freelancers" (interactive parts of job_explore/details.blade.php). */
export function BidButton({ job, role, profileComplete, alreadyBid, curText, budget, policies }: { job: { _id: string; title: string; customBudget: boolean }; role: string | null; profileComplete: boolean; alreadyBid: boolean; curText: string; budget: string; policies: { slug: string; title: string }[] }) {
  const [open, setOpen] = useState(false); const [f, setF] = useState({ bidAmount: '', estimatedTime: '', bidQuote: '' }); const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false); const [pulse, setPulse] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPulse(false), 10000); return () => clearTimeout(t); }, []);
  const disabled = alreadyBid || !profileComplete;
  return (
    <>
      {role === 'user' ? (
        <>
          <button className={`btn btn--base w-100 mt-3 bidModalBtn${disabled ? ' disabled' : ''}${pulse && !disabled ? ' has-indicator' : ''}`} onClick={() => !disabled && setOpen(true)}><i className="lab la-gavel" /> Bid on the project</button>
          {!profileComplete && <small className="d-flex justify-content-center mt-1">Complete your work profile first!</small>}
        </>
      ) : <a className="text-center btn btn--base w-100" href="/freelancer/login">Bid on the project</a>}
      <p className="sidebar-header__text">By clicking contact, you have read and agreed to our {policies.map((p, i) => <a key={p.slug} href={`/policy/${p.slug}`} className="text--base"> {p.title} {i < policies.length - 1 ? ',' : ''}</a>)}</p>
      {open && (
        <>
          <div className="modal custom--modal fade show" style={{ display: 'block' }} tabIndex={-1}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
            <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await api('/api/freelancer/bids', { body: { jobId: job._id, bidAmount: job.customBudget ? Number(f.bidAmount) : undefined, estimatedTime: f.estimatedTime, bidQuote: f.bidQuote } }); window.location.href = '/freelancer/bid/index'; } catch (err) { setMsg({ ok: false, t: (err as Error).message }); setBusy(false); } }}>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center"><h5 className="mb-2">{job.title}</h5><button className="btn-close" type="button" onClick={() => setOpen(false)} /></div>
                <p className="mb-3"><i className="las la-angle-double-right" /> Are you sure you&apos;ve read this job post carefully?</p>
                <h6 className="mb-3">{job.customBudget ? 'Estimated Budget' : 'Budget'} : {budget}</h6>
                {job.customBudget && <div className="form-group mb-3"><label className="form-label">Your Bid Amount</label><div className="input-group"><input type="number" step="any" className="form-control form--control" placeholder="Enter your bid amount" required value={f.bidAmount} onChange={(e) => setF({ ...f, bidAmount: e.target.value })} /><span className="input-group-text">{curText}</span></div></div>}
                <div className="form-group mb-3"><label className="form-label">Estimated Time</label><input type="text" className="form-control form--control" placeholder="Estimate in time, days or weeks, e.g. 10 hours, 2 days" required maxLength={40} value={f.estimatedTime} onChange={(e) => setF({ ...f, estimatedTime: e.target.value })} /></div>
                <div className="form-group mb-3"><label className="form-label">Your Bid Quote</label><textarea className="form-control form--control" rows={5} placeholder="Write why you are the best fit for this job." required value={f.bidQuote} onChange={(e) => setF({ ...f, bidQuote: e.target.value })} /></div>
                {msg && <p className="text-danger">{msg.t}</p>}
                <div className="text-end"><button type="submit" className="btn btn--base" disabled={busy}>Submit</button></div>
              </div>
            </form>
          </div></div></div>
          <div className="modal-backdrop fade show" onClick={() => setOpen(false)} />
        </>
      )}
    </>
  );
}

export function MoreBidders({ slug, initial, total }: { slug: string; initial: Bidder[]; total: number }) {
  const [items, setItems] = useState(initial); const [offset, setOffset] = useState<number | null>(initial.length >= 5 && total > 5 ? 5 : null); const [busy, setBusy] = useState(false);
  return (
    <>
      <div className="freelancers-wrapper">
        {items.length ? items.map((b) => <BidderCard key={b._id} f={b} />) : <div className="empty-message text-center py-5"><img src="/assets/templates/basic/images/empty.png" alt="empty" /><p className="text-muted mt-3">No freelancer found!</p></div>}
      </div>
      {offset !== null && (
        <div className="bid-wrapper__bottom"><button className="btn-outline--base btn moreFreelancerBtn" onClick={async () => { setBusy(true); try { const r = await api<{ items: Bidder[]; nextOffset: number | null }>(`/api/jobs/${slug}/bidders?offset=${offset}&limit=5`); setItems((x) => [...x, ...r.items]); setOffset(r.nextOffset); } finally { setBusy(false); } }}>{busy ? <div className="text-center"><div className="spinner-border" role="status" /></div> : 'Load more'}</button></div>
      )}
    </>
  );
}
