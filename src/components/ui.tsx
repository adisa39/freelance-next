'use client';
import { useState } from 'react';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export function Card({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('card custom--card', className)}>
      {(title || actions) && <div className="card-header d-flex align-items-center justify-content-between gap-3"><h5 className="card-title mb-0">{title}</h5><div className="d-flex gap-2">{actions}</div></div>}
      <div className="card-body">{children}</div>
    </section>
  );
}

export function Btn({ variant = 'primary', busy, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' | 'success'; busy?: boolean }) {
  const v = { primary: 'btn btn--base', ghost: 'btn btn-outline--base', danger: 'btn btn--danger', success: 'btn btn--success' }[variant];
  return <button {...p} disabled={p.disabled || busy} className={cx(v, 'btn--sm', className)}>{busy ? '…' : p.children}</button>;
}

const inputCls = 'form-control form--control';
export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div className="form-group"><label className="form--label">{label}</label>{children}{hint && <small className="d-block text-muted">{hint}</small>}</div>;
}
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea rows={4} {...p} className={cx(inputCls, p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx('form-select form--control', p.className)} />;

const tone: Record<string, string> = { gray: 'badge--dark', green: 'badge--success', yellow: 'badge--warning', red: 'badge--danger', blue: 'badge--primary', indigo: 'badge--primary' };
export const Badge = ({ children, color = 'gray' }: { children: React.ReactNode; color?: keyof typeof tone }) => <span className={cx('badge', tone[color])}>{children}</span>;

export const statusColor = {
  project: { 1: 'blue', 2: 'green', 3: 'red', 4: 'indigo', 5: 'yellow' } as Record<number, string>,
  bid: { 0: 'yellow', 1: 'green', 2: 'indigo', 3: 'red', 4: 'gray' } as Record<number, string>,
  payment: { 0: 'gray', 1: 'green', 2: 'yellow', 3: 'red' } as Record<number, string>,
  approval: { 0: 'yellow', 1: 'green', 3: 'red' } as Record<number, string>,
};

export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="dashboard-table">
      <table className="table table--responsive--lg">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
      {empty && <div className="empty-message text-center py-4"><img src="/assets/templates/basic/images/empty.png" alt="empty" style={{ width: 75 }} /><p className="text-muted mt-2">Nothing here yet.</p></div>}
    </div>
  );
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <ul className="pagination justify-content-end mt-3">
      <li className={`page-item${page <= 1 ? ' disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPage(page - 1); }}>‹</a></li>
      <li className="page-item active"><span className="page-link">{page} / {pages}</span></li>
      <li className={`page-item${page >= pages ? ' disabled' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); onPage(page + 1); }}>›</a></li>
    </ul>
  );
}

export const Loading = () => <p className="py-5 text-center text-muted">Loading…</p>;
export const ErrorMsg = ({ children }: { children?: React.ReactNode }) => (children ? <div className="alert alert-danger py-2">{children}</div> : null);
export const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="dashboard-widget"><div className="dashboard-widget__icon flex-center"><i className="las la-chart-bar" /></div><div className="dashboard-widget__content"><span className="dashboard-widget__text"> {label} </span><h5 className="dashboard-widget__number"> {value} </h5></div></div>
);

/** Run an async action with busy + error state. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    setBusy(true); setError('');
    try { return await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return { busy, error, run, setError };
}
