import Breadcrumb from '@/components/site/Breadcrumb';
import { getContent } from '@/lib/cms';

const css = '.privacy-page h5{font-weight:600;margin-bottom:8px}.privacy-page ul,.privacy-page ol{padding-left:20px}.privacy-page ul,.privacy-page li{list-style:auto}';
export default async function CookiePolicy() {
  const c = await getContent('cookie.data', true);
  return (
    <>
      <Breadcrumb title="Cookie Policy" />
      <section className="my-120 privacy-page"><div className="container"><div className="row"><div className="col-md-12" dangerouslySetInnerHTML={{ __html: c.description }} /></div></div></section>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
