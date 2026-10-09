import { notFound } from 'next/navigation';
import Breadcrumb from '@/components/site/Breadcrumb';
import { getContent } from '@/lib/cms';

const css = '.privacy-page h5{font-weight:600;margin-bottom:8px}.privacy-page ul,.privacy-page ol{padding-left:20px}.privacy-page ul,.privacy-page li{list-style:auto}';
export default async function Policy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = (await getContent('policy_pages.element', false, null, true)).find((p) => p.slug === slug);
  if (!policy) notFound();
  return (
    <>
      <Breadcrumb title={policy.dataValues.title} />
      <section className="my-120 privacy-page"><div className="container"><div className="row"><div className="col-md-12" dangerouslySetInnerHTML={{ __html: policy.dataValues.details }} /></div></div></section>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
