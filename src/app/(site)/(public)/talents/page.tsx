import Breadcrumb from '@/components/site/Breadcrumb';
import Empty from '@/components/site/Empty';
import FreelancerCard from '@/components/site/FreelancerCard';
import PageCss from '@/components/site/PageCss';
import { SECTIONS } from '@/components/site/sections';
import { getPage } from '@/lib/cms';
import { listTalents } from '@/lib/public-data';

export const metadata = { title: 'Talents' };

export default async function Talents({ searchParams }: { searchParams: Promise<{ rating?: string; skill?: string; search?: string; page?: string }> }) {
  const sp = await searchParams;
  const [{ items, total, pages, skills }, pg] = await Promise.all([listTalents({ ...sp, page: Number(sp.page ?? 1) }), getPage('talents')]);
  const page = Number(sp.page ?? 1);
  const qs = (p: number) => { const q = new URLSearchParams({ ...(sp.rating && { rating: sp.rating }), ...(sp.skill && { skill: sp.skill }), ...(sp.search && { search: sp.search }), page: String(p) }); return `/talents?${q}`; };
  return (
    <>
      <PageCss name="freelancers" />
      <Breadcrumb title="Talents" />
      <div className="talent-main-section mb-120 mt-60">
        <div className="talent-section my-60"><div className="container">
          <div className="filter-wrapper">
            <div className="filter-wrapper__content">
              <span className="filter-wrapper__content-title">Filter</span>
              <form className="filter-form" method="GET">
                <select className="form-select form--control select2" id="rating" name="rating" data-minimum-results-for-search="-1" data-placeholder="Select Rating" defaultValue={sp.rating ?? '0'}>
                  <option value="0" disabled>All Star</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star</option>)}
                </select>
                <select className="form-select form--control select2" id="skill" name="skill" data-placeholder="Select Skill" defaultValue={sp.skill ?? ''}>
                  <option value=""> Skills</option>{skills.map((s: { _id: string; name: string }) => <option key={s._id} value={s._id}> {s.name}</option>)}
                </select>
                <input className="form-control form--control" id="search" name="search" type="search" defaultValue={sp.search ?? ''} placeholder="Search Talent" />
                <button className="btn btn--base"><i className="las la-filter" /></button>
              </form>
            </div>
            <div className="filter-wrapper__right d-none d-lg-block"><p className="filter-wrapper__right-text">{total} result</p></div>
          </div>
          <div className="row gy-4 justify-content-center">
            {items.length ? items.map((f: never) => <div key={(f as { _id: string })._id} className="col-xl-3 col-sm-6"><FreelancerCard f={f} /></div>) : <div className="col-12"><Empty message="Talents not found!" /></div>}
            {pages > 1 && <ul className="pagination justify-content-center">{Array.from({ length: pages }, (_, i) => <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}><a className="page-link" href={qs(i + 1)}>{i + 1}</a></li>)}</ul>}
          </div>
        </div></div>
        {pg?.secs.map((s) => { const C = SECTIONS[s]; return C ? <C key={s} /> : null; })}
      </div>
    </>
  );
}
