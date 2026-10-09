import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { getPages } from '@/lib/cms';
import { readSession } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [pages, session] = await Promise.all([getPages(), readSession()]);
  return (
    <>
      <SiteHeader pages={pages.filter((p) => !p.isDefault).map((p) => ({ name: p.name, slug: p.slug }))} role={session?.role ?? null} />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
