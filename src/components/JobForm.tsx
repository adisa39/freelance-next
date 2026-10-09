'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useApi } from '@/lib/client';
import { Btn, Card, ErrorMsg, Field, Input, Select, Textarea, useAction } from './ui';
import { LABELS } from '@/lib/constants';

const empty = { title: '', slug: '', category: '', subcategory: '', description: '', budget: '', customBudget: false, projectScope: '2', jobLongevity: '2', skillLevel: '3', deadline: '', questions: [] as string[], skillIds: [] as string[], status: 1 };

export default function JobForm({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const { data: cat } = useApi<{ categories: any[]; subcategories: any[]; skills: any[] }>('/api/catalog'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: existing } = useApi<any>(jobId ? `/api/buyer/jobs/${jobId}` : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [f, setF] = useState(empty);
  const { busy, error, run } = useAction();
  useEffect(() => {
    if (existing) setF({ ...empty, ...existing, category: existing.category._id, subcategory: existing.subcategory._id, budget: String(existing.budget), projectScope: String(existing.projectScope), jobLongevity: String(existing.jobLongevity), skillLevel: String(existing.skillLevel), deadline: existing.deadline.slice(0, 10), skillIds: existing.skillIds.map((s: { _id: string }) => s._id) });
  }, [existing]);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const subs = cat?.subcategories.filter((s) => s.category === f.category) ?? [];
  const submit = (status: 0 | 1) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    run(async () => {
      const body = { ...f, status, budget: Number(f.budget), projectScope: Number(f.projectScope), jobLongevity: Number(f.jobLongevity), skillLevel: Number(f.skillLevel), slug: f.slug || undefined, questions: f.questions.filter(Boolean) };
      await api(jobId ? `/api/buyer/jobs/${jobId}` : '/api/buyer/jobs', { method: jobId ? 'PUT' : 'POST', body });
      router.push('/buyer/jobs');
    });
  };
  return (
    <form onSubmit={submit(1)} className="space-y-6">
      <Card title="Job details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><Input required value={f.title} onChange={(e) => set('title', e.target.value)} /></Field>
          <Field label="Slug (URL)" hint="Leave blank to generate from the title"><Input value={f.slug} onChange={(e) => set('slug', e.target.value)} /></Field>
          <Field label="Category"><Select required value={f.category} onChange={(e) => { set('category', e.target.value); set('subcategory', ''); }}><option value="">Select…</option>{cat?.categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select></Field>
          <Field label="Subcategory"><Select required value={f.subcategory} onChange={(e) => set('subcategory', e.target.value)}><option value="">Select…</option>{subs.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</Select></Field>
          <div className="md:col-span-2"><Field label="Description"><Textarea required rows={7} value={f.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
        </div>
      </Card>
      <Card title="Budget & scope">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Budget"><Input required type="number" step="0.01" min="0.01" value={f.budget} onChange={(e) => set('budget', e.target.value)} /></Field>
          <Field label="Pricing"><Select value={f.customBudget ? '1' : '0'} onChange={(e) => set('customBudget', e.target.value === '1')}><option value="0">Fixed price</option><option value="1">Freelancers propose a price</option></Select></Field>
          <Field label="Deadline"><Input required type="date" value={f.deadline} onChange={(e) => set('deadline', e.target.value)} /></Field>
          <Field label="Project scope"><Select value={f.projectScope} onChange={(e) => set('projectScope', e.target.value)}>{Object.entries(LABELS.scope).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Duration"><Select value={f.jobLongevity} onChange={(e) => set('jobLongevity', e.target.value)}>{Object.entries(LABELS.longevity).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Experience level"><Select value={f.skillLevel} onChange={(e) => set('skillLevel', e.target.value)}>{Object.entries(LABELS.skillLevel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        </div>
      </Card>
      <Card title="Skills">
        <div className="flex flex-wrap gap-2">{cat?.skills.map((s) => { const on = f.skillIds.includes(s._id); return <button type="button" key={s._id} onClick={() => set('skillIds', on ? f.skillIds.filter((x) => x !== s._id) : [...f.skillIds, s._id])} className={`rounded-full border px-3 py-1 text-sm ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>{s.name}</button>; })}</div>
      </Card>
      <Card title="Screening questions (optional, max 5)">
        <div className="space-y-2">{f.questions.map((q, i) => <div key={i} className="flex gap-2"><Input value={q} onChange={(e) => set('questions', f.questions.map((x, j) => (j === i ? e.target.value : x)))} /><Btn type="button" variant="ghost" onClick={() => set('questions', f.questions.filter((_, j) => j !== i))}>✕</Btn></div>)}
          {f.questions.length < 5 && <Btn type="button" variant="ghost" onClick={() => set('questions', [...f.questions, ''])}>+ Add question</Btn>}</div>
      </Card>
      <ErrorMsg>{error}</ErrorMsg>
      <div className="flex gap-3"><Btn busy={busy} disabled={!f.skillIds.length}>Publish</Btn><Btn type="button" variant="ghost" busy={busy} onClick={submit(0)}>Save as draft</Btn></div>
    </form>
  );
}
