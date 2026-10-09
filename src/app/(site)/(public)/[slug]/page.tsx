import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/site/Breadcrumb';
import { SECTIONS } from '@/components/site/sections';
import { getPage } from '@/lib/cms';

/** Laravel `pages` route: CMS-defined page built from a list of sections (e.g. /about). */
export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page || page.slug === '/') notFound();
  return (
    <>
      <Breadcrumb title={page.name} />
      {page.secs.map((s) => { const C = SECTIONS[s]; return C ? <C key={s} /> : null; })}
    </>
  );
}
