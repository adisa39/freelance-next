'use client';
import { useEffect, useState } from 'react';
import { api, useApi } from '@/lib/client';
import { Badge, Btn, Card, ErrorMsg, Field, Input, Loading, Textarea, useAction } from '@/components/ui';

type Edu = { school: string; degree?: string; yearFrom?: string; yearTo?: string; description?: string };
type Port = { title: string; description?: string; role?: string; skillIds: string[] };

export default function Profile() {
  const { data: p } = useApi<any>('/api/freelancer/profile'); // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: cat } = useApi<{ skills: { _id: string; name: string }[] }>('/api/catalog');
  const [f, setF] = useState({ firstname: '', lastname: '', tagline: '', about: '', country: '', city: '', skillIds: [] as string[], educations: [] as Edu[], portfolios: [] as Port[] });
  const [saved, setSaved] = useState<boolean | null>(null);
  const { busy, error, run } = useAction();
  useEffect(() => { if (p) setF({ firstname: p.firstname ?? '', lastname: p.lastname ?? '', tagline: p.tagline ?? '', about: p.about ?? '', country: p.country ?? '', city: p.city ?? '', skillIds: (p.skillIds ?? []).map((s: { _id: string }) => s._id), educations: p.educations ?? [], portfolios: (p.portfolios ?? []).map((x: Port) => ({ ...x, skillIds: x.skillIds ?? [] })) }); }, [p]);
  if (!p) return <Loading />;
  const save = (e: React.FormEvent) => { e.preventDefault(); run(async () => { const r = await api<{ workProfileComplete: boolean }>('/api/freelancer/profile', { method: 'PUT', body: f }); setSaved(r.workProfileComplete); }); };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Profile</h1>{saved !== null && <Badge color={saved ? 'green' : 'yellow'}>{saved ? 'Profile complete — you can bid' : 'Add a headline, bio and at least one skill to start bidding'}</Badge>}</div>
      <Card title="About you"><div className="grid gap-4 md:grid-cols-2">
        <Field label="First name"><Input required value={f.firstname} onChange={set('firstname')} /></Field><Field label="Last name"><Input required value={f.lastname} onChange={set('lastname')} /></Field>
        <Field label="Tagline"><Input value={f.tagline} onChange={set('tagline')} placeholder="e.g. Backend Developer" /></Field>
        <Field label="Country"><Input value={f.country} onChange={set('country')} /></Field><Field label="City"><Input value={f.city} onChange={set('city')} /></Field>
        <div className="md:col-span-2"><Field label="About"><Textarea rows={6} value={f.about} onChange={set('about')} /></Field></div>
      </div></Card>
      <Card title="Skills"><div className="flex flex-wrap gap-2">{cat?.skills.map((s) => { const on = f.skillIds.includes(s._id); return <button type="button" key={s._id} onClick={() => setF({ ...f, skillIds: on ? f.skillIds.filter((x) => x !== s._id) : [...f.skillIds, s._id] })} className={`rounded-full border px-3 py-1 text-sm ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>{s.name}</button>; })}</div></Card>
      <Card title="Education" actions={<Btn type="button" variant="ghost" onClick={() => setF({ ...f, educations: [...f.educations, { school: '' }] })}>+ Add</Btn>}>
        <div className="space-y-3">{f.educations.map((ed, i) => <div key={i} className="grid gap-2 md:grid-cols-4"><Input placeholder="School" value={ed.school} onChange={(e) => setF({ ...f, educations: f.educations.map((x, j) => (j === i ? { ...x, school: e.target.value } : x)) })} /><Input placeholder="Degree" value={ed.degree ?? ''} onChange={(e) => setF({ ...f, educations: f.educations.map((x, j) => (j === i ? { ...x, degree: e.target.value } : x)) })} /><Input placeholder="Year from" value={ed.yearFrom ?? ''} onChange={(e) => setF({ ...f, educations: f.educations.map((x, j) => (j === i ? { ...x, yearFrom: e.target.value } : x)) })} /><div className="flex gap-2"><Input placeholder="Year to" value={ed.yearTo ?? ''} onChange={(e) => setF({ ...f, educations: f.educations.map((x, j) => (j === i ? { ...x, yearTo: e.target.value } : x)) })} /><Btn type="button" variant="ghost" onClick={() => setF({ ...f, educations: f.educations.filter((_, j) => j !== i) })}>✕</Btn></div></div>)}</div>
      </Card>
      <Card title="Portfolio" actions={<Btn type="button" variant="ghost" onClick={() => setF({ ...f, portfolios: [...f.portfolios, { title: '', skillIds: [] }] })}>+ Add</Btn>}>
        <div className="space-y-3">{f.portfolios.map((pt, i) => <div key={i} className="grid gap-2 md:grid-cols-3"><Input placeholder="Title" value={pt.title} onChange={(e) => setF({ ...f, portfolios: f.portfolios.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} /><Input placeholder="Your role" value={pt.role ?? ''} onChange={(e) => setF({ ...f, portfolios: f.portfolios.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })} /><div className="flex gap-2"><Input placeholder="Description" value={pt.description ?? ''} onChange={(e) => setF({ ...f, portfolios: f.portfolios.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} /><Btn type="button" variant="ghost" onClick={() => setF({ ...f, portfolios: f.portfolios.filter((_, j) => j !== i) })}>✕</Btn></div></div>)}</div>
      </Card>
      <ErrorMsg>{error}</ErrorMsg><Btn busy={busy}>Save profile</Btn>
    </form>
  );
}
