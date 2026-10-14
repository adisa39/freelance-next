'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { siteLogo } from '@/lib/template';

type Props = { pages: { name: string; slug: string }[]; role: 'user' | 'buyer' | 'admin' | null };
const dash = (role: Props['role']) => (role === 'buyer' ? '/client/dashboard' : '/freelancer/dashboard');

/** Port of partials/header.blade.php. Links are plain <a> (full page loads) like the Laravel site, so the jQuery template JS re-initialises per page. */
export default function SiteHeader({ pages, role }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const act = (...p: string[]) => (p.some((x) => (x === '/' ? path === '/' : path === x || path.startsWith(x + '/'))) ? 'active' : '');
  const authed = role === 'user' || role === 'buyer';
  return (
    <header className="header" id="header">
      <div className="container">
        <nav className="navbar navbar-expand-xl navbar-light" style={{ position: 'relative', zIndex: 101 }}>
          <a className="navbar-brand logo" href="/"><img src={siteLogo()} alt="" /></a>
          <div className="d-xl-none d-block job-link"><a href="/client/job/post/form" className="btn btn--base btn--sm">Post Job</a></div>
          <button className="navbar-toggler header-button" type="button" aria-controls="navbarSupportedContent" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}>
            <span id="hiddenNav"><i className="las la-bars" /></span>
          </button>
          <div className={`site-navbar-collapse${open ? ' is-open' : ''}`} id="navbarSupportedContent">
            <ul className="navbar-nav nav-menu me-auto align-items-xl-center">
              <li className={`nav-item ${act('/')}`}><a className="nav-link" aria-current="page" href="/"> Home </a></li>
              {pages.length > 1 ? (
                <li className="nav-item dropdown">
                  <button className="nav-link border-0 bg-transparent" type="button" aria-expanded={pagesOpen} onClick={() => setPagesOpen((value) => !value)}>Pages <span className="nav-item__icon"><i className="las la-angle-down" /></span></button>
                  <ul className={`dropdown-menu${pagesOpen ? ' show' : ''}`}>{pages.map((p) => <li key={p.slug} className={`dropdown-menu__list ${act('/' + p.slug)}`}><a className="dropdown-item dropdown-menu__link" href={`/${p.slug}`}>{p.name}</a></li>)}</ul>
                </li>
              ) : pages.map((p) => <li key={p.slug} className={`nav-item ${act('/' + p.slug)}`}><a className="nav-link" href={`/${p.slug}`}>{p.name}</a></li>)}
              <li className={`nav-item ${act('/freelance-jobs', '/explore-job')}`}><a className="nav-link " href="/freelance-jobs"> Find Jobs </a></li>
              <li className={`nav-item ${act('/talents', '/talent')}`}><a className="nav-link" href="/talents"> Find Talents </a></li>
              <li className={`nav-item ${act('/blogs', '/blog')}`}><a className="nav-link" href="/blogs">Blogs </a></li>
              <li className={`nav-item ${act('/contact')}`}><a className="nav-link" href="/contact">Contact </a></li>
              <li className="nav-item d-flex justify-content-between w-100 d-xl-none">
                <div className="top-button w-100">
                  <ul className="login-registration-list d-flex flex-wrap justify-content-between align-items-center">
                    <li className="login-registration-list__item d-flex gap-3">
                      {authed ? <a href={dash(role)} className="login-registration-list__link"> Dashboard </a> : <><a href="/freelancer/login" className="login-registration-list__link"> Login </a><a href="/freelancer/register" className="login-registration-list__link"> Register </a></>}
                    </li>
                    <li className="login-registration-list__item" />
                  </ul>
                </div>
              </li>
            </ul>
          </div>
          <div className="d-xl-block d-none">
            <div className="top-button d-flex flex-wrap justify-content-between align-items-center">
              <ul className="login-registration-list d-flex flex-wrap justify-content-between align-items-center">
                {authed ? <li className="login-registration-list__item"><a href={dash(role)} className="login-registration-list__link"> Dashboard </a></li> : (
                  <>
                    <li className="login-registration-list__item"><a href="/freelancer/login" className="login-registration-list__link"> Login </a></li>
                    <li className="login-registration-list__item"><a href="/freelancer/register" className="login-registration-list__link"> Register </a></li>
                  </>
                )}
                {!authed && <li className="login-registration-list__item"><a href="/client/job/post/form" className="btn btn--base"> Post Job </a></li>}
              </ul>
            </div>
          </div>
        </nav>
      </div>
      {open && <button className="body-overlay show show-overlay" style={{ zIndex: 100 }} aria-label="Close navigation" onClick={() => setOpen(false)} />}
    </header>
  );
}
