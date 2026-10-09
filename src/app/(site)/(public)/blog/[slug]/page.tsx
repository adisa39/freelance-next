import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/site/Breadcrumb';
import { getContent } from '@/lib/cms';
import { frontendImage, strLimit } from '@/lib/template';

const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).replace(',', '') : '');
const css = `.blog-details{border-radius:8px;overflow:hidden;height:100%}.blog-details__thumb{height:600px;max-height:100%;border-radius:10px;overflow:hidden}@media screen and (max-width:1199px){.blog-details__thumb{height:450px}}@media screen and (max-width:767px){.blog-details__thumb{height:300px}}.blog-details__content{padding-top:24px}.blog-details__content h6{font-weight:600}.blog-details__title{margin-top:30px;margin-bottom:15px}.blog-item__date-icon{font-size:24px}.blog-item__date{display:flex;align-items:center;gap:10px}.blog-details__desc{margin-bottom:24px}.blog-details .social-list__link{border:1px solid hsl(var(--border-color));color:hsl(var(--text-color));width:35px;height:35px;background-color:hsl(var(--white)/.1);font-size:16px}.blog-details__share .social-list{gap:8px}.blog-details__share .social-list__link:hover{color:hsl(var(--white))!important;background-color:hsl(var(--base))}`;

export default async function BlogDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const all = await getContent('blog.element');
  const blog = all.find((b) => b.slug === slug);
  if (!blog) notFound();
  const latest = all.filter((b) => b.slug !== slug).slice(0, 5);
  const v = blog.dataValues;
  const url = encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/blog/${slug}`);
  return (
    <>
      <Breadcrumb title={v.title} subTitle="Blogs" toRoute="/blogs" />
      <section className="blog-detials py-60"><div className="container"><div className="row gy-5 justify-content-center">
        <div className="col-xl-9 col-lg-8"><div className="blog-details">
          <div className="blog-details__thumb"><img src={frontendImage('blog', v.image)} className="fit-image" alt="blog" /></div>
          <div className="blog-details__content">
            <span className="blog-item__date text--base mb-2"><span className="blog-item__date-icon"><i className="las la-clock" /></span> {fmt((blog as { createdAt?: string }).createdAt)} </span>
            <h4 className="blog-details__title">{v.title}</h4>
            <div className="blog-details__desc" dangerouslySetInnerHTML={{ __html: v.description }} />
            <div className="blog-details__share mt-4 d-flex align-items-center flex-wrap justify-content-start">
              <h6 className="social-share__title mb-0 me-sm-3 me-1 d-inline-block">Share :</h6>
              <ul className="social-list">
                {[['https://www.facebook.com/sharer/sharer.php?u=', 'fab fa-facebook-f'], ['https://twitter.com/share?url=', 'fa-brands fa-x-twitter'], ['https://www.linkedin.com/shareArticle?mini=true&url=', 'fab fa-linkedin-in'], ['https://wa.me/?text=', 'fab fa-whatsapp'], ['https://t.me/share/url?url=', 'fab fa-telegram']].map(([h, i]) => <li key={i} className="social-list__item"><a href={h + url} className="social-list__link flex-center" target="_blank" rel="noreferrer"><i className={i} /></a></li>)}
              </ul>
            </div>
          </div>
        </div></div>
        <div className="col-xl-3 col-lg-4"><div className="blog-sidebar-wrapper">
          <div className="blog-sidebar"><h5 className="blog-sidebar__title">Latest Blogs</h5></div>
          <div className="blog-sidebar">
            {latest.length ? latest.map((b) => (
              <div key={b.id} className="latest-blog">
                <a href={`/blog/${b.slug}`} className="latest-blog__thumb"><img src={frontendImage('blog', `thumb_${b.dataValues.image}`)} className="fit-image" alt="" /></a>
                <div className="latest-blog__content"><h6 className="latest-blog__title"><a href={`/blog/${b.slug}`}>{strLimit(b.dataValues.title, 80)}</a></h6><span className="latest-blog__date fs-13 text--base"><i className="las la-clock" /> {fmt((b as { createdAt?: string }).createdAt)}</span></div>
              </div>
            )) : <span className="latest-blog"> Latest blog not found!</span>}
          </div>
        </div></div>
      </div></div></section>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
