import Breadcrumb from '@/components/site/Breadcrumb';
import { SECTIONS } from '@/components/site/sections';
import { getContent, getPage } from '@/lib/cms';
import { asset, frontendImage, strLimit } from '@/lib/template';

export const metadata = { title: 'Blogs' };
const PER = 12;

export default async function Blogs({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page ?? 1));
  const [all, pg] = await Promise.all([getContent('blog.element'), getPage('blog')]);
  const pages = Math.max(1, Math.ceil(all.length / PER));
  const blogs = all.slice((page - 1) * PER, page * PER);
  return (
    <>
      <Breadcrumb title="Blogs" />
      <section className="container py-120">
        <div className="row gy-4 justify-content-center">
          {blogs.length ? blogs.map((b) => (
            <div key={b.id} className="col-xl-4 col-sm-6">
              <a href={`/blog/${b.slug}`} className="blog-item">
                <div className="blog-item__thumb"><img src={frontendImage('blog', `thumb_${b.dataValues.image}`)} className="fit-image" alt="" /></div>
                <div className="blog-item__content"><h6 className="blog-item__title">{strLimit(b.dataValues.title, 80)}</h6></div>
              </a>
            </div>
          )) : <div className="d-flex flex-column justify-content-center align-items-center"><div className="text-center"><img src={asset('templates/basic/images/empty.png')} alt="empty" className="img-fluid" /><h6 className="text-muted mt-3">Blogs not found</h6></div></div>}
          {pages > 1 && <div className="col-12"><ul className="pagination justify-content-center">{Array.from({ length: pages }, (_, i) => <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}><a className="page-link" href={`/blogs?page=${i + 1}`}>{i + 1}</a></li>)}</ul></div>}
        </div>
        {pg?.secs.length ? <div className="pt-120">{pg.secs.map((s) => { const C = SECTIONS[s]; return C ? <C key={s} /> : null; })}</div> : null}
      </section>
    </>
  );
}
