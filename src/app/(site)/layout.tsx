import type { Metadata } from 'next';
import './site.css';
import { getContent, getSiteSettings } from '@/lib/cms';
import { asset, themeCss } from '@/lib/template';
import LegacyScripts from '@/components/site/LegacyScripts';
import CookieCard from '@/components/site/CookieCard';
import Preloader from '@/components/site/Preloader';

export async function generateMetadata(): Promise<Metadata> {
  const [s, seo] = await Promise.all([getSiteSettings(), getContent('seo.data', true)]);
  return { title: { default: `${s.siteName} - Global Freelancing Marketplace`, template: `${s.siteName} - %s` }, description: seo.description, keywords: seo.keywords, icons: { icon: asset('images/logo_icon/favicon.png') } };
}

const css = ['global/css/bootstrap.min.css', 'global/css/all.min.css', 'global/css/line-awesome.min.css', 'global/css/select2.min.css', 'templates/basic/css/odometer.css', 'templates/basic/css/slick.css', 'templates/basic/css/main.css', 'templates/basic/css/custom.css'];

export default async function SiteRoot({ children }: { children: React.ReactNode }) {
  const [s, cookie] = await Promise.all([getSiteSettings(), getContent('cookie.data', true)]);
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {css.map((c) => <link key={c} rel="stylesheet" href={asset(c)} />)}
        <style dangerouslySetInnerHTML={{ __html: themeCss(s.baseColor, s.secondaryColor) }} />
      </head>
      <body>
        {/* <Preloader /> */}
        <div className="body-overlay" />
        <div className="sidebar-overlay" />
        <a className="scroll-top"><i className="fas fa-angle-double-up" /></a>
        {children}
        {cookie.status === 1 && <CookieCard text={cookie.short_desc} />}
        <LegacyScripts />
      </body>
    </html>
  );
}
