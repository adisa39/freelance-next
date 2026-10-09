'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, useApi } from '@/lib/client';
import JobCard, { type JobView } from './JobCard';

type Facets = { categories: { _id: string; name: string; jobsCount: number }[]; subcategories: { _id: string; name: string; jobsCount: number }[]; counting: Record<string, number> };
type Res = { items: JobView[]; page: number; pages: number };

/** Port of job_explore/jobs.blade.php — same sidebar/accordion/search markup; filtering calls /api/jobs (the Laravel version used an AJAX HTML partial). */
export default function JobsExplorer({ initialSearch = '', initialCategory = '' }: { initialSearch?: string; initialCategory?: string }) {
  const { data: facets } = useApi<Facets>('/api/jobs/facets');
  const [f, setF] = useState({ min_budget: '', max_budget: '', category_id: initialCategory, subcategory_id: [] as string[], project_scope: [] as string[], skill_level: [] as string[], search: initialSearch });
  const [page, setPage] = useState(1);
  const [res, setRes] = useState<Res | null>(null); const [loading, setLoading] = useState(true); const [err, setErr] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const load = useCallback(async (flt: typeof f, pg: number) => {
    setLoading(true);
    const q = new URLSearchParams(); q.set('page', String(pg));
    (['min_budget', 'max_budget', 'category_id', 'search'] as const).forEach((k) => flt[k] && q.set(k, flt[k]));
    (['subcategory_id', 'project_scope', 'skill_level'] as const).forEach((k) => flt[k].forEach((v) => q.append(k, v)));
    try { setRes(await api<Res>(`/api/jobs?${q}`)); setErr(''); } catch { setErr('Failed to load data. Please try again.'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => load(f, page), 400); return () => clearTimeout(timer.current); }, [f, page, load]);
  const upd = (patch: Partial<typeof f>) => { setPage(1); setF((x) => ({ ...x, ...patch })); };
  const toggle = (k: 'subcategory_id' | 'project_scope' | 'skill_level', v: string) => upd({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
  const c = facets?.counting ?? {};
  const Block = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="filter-block"><div className="accordion-item">
      <h2 className="accordion-header"><button className="accordion-button" data-bs-toggle="collapse" data-bs-target={`#${id}`} type="button" aria-expanded="true">{title}</button></h2>
      <div className="accordion-collapse show collapse" id={id}><div className="accordion-body"><ul className={`filter-block__list${id === 'category' ? ' category' : ''}`}>{children}</ul></div></div>
    </div></div>
  );
  const Check = ({ id, type, name, value, checked, onChange, label, count }: { id: string; type: 'radio' | 'checkbox'; name: string; value: string; checked: boolean; onChange: () => void; label: string; count: number }) => (
    <li className="filter-block__item"><div className="form--check">
      <input className="form-check-input" id={id} name={name} type={type} value={value} checked={checked} onChange={onChange} />
      <label className="form-check-label" htmlFor={id}><span className="label-text"> {label} </span><span className="label-text"> ({count}) </span></label>
    </div></li>
  );
  const catTotal = facets?.categories.reduce((a, x) => a + x.jobsCount, 0) ?? 0;
  return (
    <div className="job-category-section mb-120 mt-60"><div className="container"><div className="job-category-wrapper">
      <div className="category-sidebar">
        <span className="sidebar-filter__close d-xl-none d-flex"><i className="las la-times" /></span>
        <div className="accordion sidebar--acordion">
          <Block id="budget" title="Budget"><li className="filter-block__item"><div className="project-value">
            <input className="form--control" name="min_budget" type="number" placeholder="Min" value={f.min_budget} onChange={(e) => upd({ min_budget: e.target.value })} />
            <span className="project-value__text"> to </span>
            <input className="form--control" name="max_budget" type="number" placeholder="Max" value={f.max_budget} onChange={(e) => upd({ max_budget: e.target.value })} />
          </div></li></Block>
          <Block id="category" title="Categories">
            <Check id="subcat_all" type="radio" name="category_id" value="" checked={!f.category_id} onChange={() => upd({ category_id: '' })} label="All" count={catTotal} />
            {facets?.categories.length === 0 && <li className="filter-block__item"> Categories not found!</li>}
            {facets?.categories.map((x) => <Check key={x._id} id={`subcat_${x._id}`} type="radio" name="category_id" value={x._id} checked={f.category_id === x._id} onChange={() => upd({ category_id: x._id })} label={x.name} count={x.jobsCount} />)}
            <li className="load-more-button text-end">Show more</li>
          </Block>
          <Block id="subcategory" title="Specialities">
            {facets?.subcategories.length === 0 && <li className="filter-block__item"> Speciality not found!</li>}
            {facets?.subcategories.map((x) => <Check key={x._id} id={`sub_${x._id}`} type="checkbox" name="subcategory_id" value={x._id} checked={f.subcategory_id.includes(x._id)} onChange={() => toggle('subcategory_id', x._id)} label={x.name} count={x.jobsCount} />)}
            <li className="load-more-button text-end">Show more</li>
          </Block>
          <Block id="scope" title="Project Scope">
            {[['large', '1', 'Large'], ['medium', '2', 'Medium'], ['small', '3', 'Small']].map(([id, v, l]) => <Check key={id} id={id} type="checkbox" name="project_scope[]" value={v} checked={f.project_scope.includes(v)} onChange={() => toggle('project_scope', v)} label={l} count={c[id] ?? 0} />)}
          </Block>
          <Block id="level" title="Experience Level">
            {[['pro-level', 'pro', '1', 'Pro Level'], ['expart', 'expert', '2', 'Expart'], ['intermediate', 'intermediate', '3', 'Intermediate'], ['entry', 'entry', '4', 'Entry']].map(([id, key, v, l]) => <Check key={id} id={id} type="checkbox" name="skill_level[]" value={v} checked={f.skill_level.includes(v)} onChange={() => toggle('skill_level', v)} label={l} count={c[key] ?? 0} />)}
          </Block>
        </div>
      </div>
      <div className="job-category-body">
        <div className="job-category-body__bar d-xl-none d-block"><span className="job-category-body__bar-icon"><i className="las la-list" /></span></div>
        <div className="job-category-body__top"><div className="search-container">
          <input className="form--control" name="search" type="search" value={f.search} onChange={(e) => upd({ search: e.target.value })} placeholder="Type job keyword" autoComplete="off" />
          <span className="search-container__icon"> <i className="las la-search" /> </span>
        </div></div>
        <div className="job-category-body__content">
          {err ? <div className="text-center py-5 text-danger">{err}</div> : loading && !res ? (
            Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton-loading">{Array.from({ length: 6 }).map((__, j) => <div key={j} className="skeleton-line" />)}</div>)
          ) : res?.items.length ? res.items.map((j) => <JobCard key={j._id} job={j} />) : (
            <div className="empty-message text-center py-5"><img src="/assets/templates/basic/images/empty.png" alt="empty" /><p className="text-muted mt-3">No job found!</p></div>
          )}
          {res && res.pages > 1 && (
            <nav><ul className="pagination">{Array.from({ length: res.pages }, (_, i) => <li key={i} className={`page-item${res.page === i + 1 ? ' active' : ''}`}><a className="page-link" href="#" onClick={(e) => { e.preventDefault(); setPage(i + 1); }}>{i + 1}</a></li>)}</ul></nav>
          )}
        </div>
      </div>
    </div></div></div>
  );
}
