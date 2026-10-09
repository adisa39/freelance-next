'use client';
import { usePathname } from 'next/navigation';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { api, fullName, useApi } from '@/lib/client';
import { asset, showAmount, siteLogo, userImage } from '@/lib/template';

type Item = { label: string; icon: string; href?: string; match?: string[]; children?: { label: string; href: string }[] };

const FREELANCER: Item[] = [
  { label: 'Dashboard', icon: 'las la-home', href: '/freelancer/dashboard' },
  { label: 'All Bids', icon: 'las la-gavel', href: '/freelancer/bids' },
  { label: 'My Projects', icon: 'las la-briefcase', href: '/freelancer/projects' },
  { label: 'Withdraw', icon: 'las la-money-check-alt', href: '/freelancer/wallet' },
  { label: 'Support Ticket', icon: 'las la-ticket-alt', href: '/freelancer/tickets' },
  { label: 'Chat', icon: 'lab la-rocketchat', href: '/freelancer/messages' },
  { label: 'Settings', icon: 'las la-cog', href: '/freelancer/profile' },
];
const BUYER: Item[] = [
  { label: 'Dashboard', icon: 'las la-home', href: '/buyer/dashboard' },
  { label: 'Post Job', icon: 'las la-plus-circle', href: '/buyer/jobs/new' },
  { label: 'My Jobs', icon: 'las la-clipboard-list', href: '/buyer/jobs' },
  { label: 'All Bids', icon: 'las la-gavel', href: '/buyer/bids' },
  { label: 'My Projects', icon: 'las la-briefcase', href: '/buyer/projects' },
  { label: 'Deposit / Withdraw', icon: 'las la-money-check-alt', href: '/buyer/wallet' },
  { label: 'Support Ticket', icon: 'las la-ticket-alt', href: '/buyer/tickets' },
  { label: 'Chat', icon: 'lab la-rocketchat', href: '/buyer/messages' },
];

/** Port of layouts/master.blade.php + partials/sidebar.blade.php (same classes; main.js drives the sidebar toggle). */
export default function DashShell({ role, title, children }: { role: 'user' | 'buyer'; title: string; children: ReactNode }) {
  const path = usePathname();
  const { data: me } = useApi<{ name: string; balance?: number; username: string }>('/api/auth/me');
  const [menu, setMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const items = role === 'user' ? FREELANCER : BUYER;
  const active = (h?: string) => (h && (h === items[0].href ? path === h : path.startsWith(h)) ? 'active' : '');
  const logout = async (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); await api('/api/auth/logout', { method: 'POST', body: {} }); window.location.href = `/${role === 'user' ? 'freelancer' : 'buyer'}/login`; };
  return (
    <div className="dashboard position-relative"><div className="dashboard__inner flex-wrap">
      <div className={`sidebar-menu flex-between${sidebarOpen ? ' show-sidebar' : ''}`}><div className="sidebar-menu__inner">
        <button type="button" aria-label="Close dashboard menu" className="sidebar-menu__close d-lg-none d-block" onClick={() => setSidebarOpen(false)}><i className="fas fa-times" /></button>
        <div className="sidebar-logo"><a href="/" className="sidebar-logo__link"><img src={siteLogo('dark')} alt="" /></a></div>
        <div className="sidebar-menu__top">
          <div className="shape"><img src={asset('templates/basic/shape/d-shape.png')} alt="" /></div>
          <span className="icon"><i className="las la-wallet" /></span>
          <div className="content"><span className="title">Balance</span><h6 className="number">{showAmount(me?.balance)}</h6></div>
        </div>
        <ul className="sidebar-menu-list">
          {items.map((i) => <li key={i.label} className={`sidebar-menu-list__item ${active(i.href)}`}><a href={i.href} className="sidebar-menu-list__link"><span className="icon"><i className={i.icon} /></span><span className="text">{i.label} </span></a></li>)}
          <li className="sidebar-menu-list__item"><a href="#" onClick={logout} className="sidebar-menu-list__link"><span className="icon"><i className="las la-sign-out-alt" /></span><span className="text">Logout</span></a></li>
        </ul>
      </div></div>
      <div className="dashboard__right">
        <div className="dashboard-header"><div className="dashboard-header__inner flex-between">
          <div className="dashboard-header__left">
            <button type="button" aria-label="Open dashboard menu" aria-expanded={sidebarOpen} className="dashboard-body__bar d-lg-none d-inline-block border-0 bg-transparent" onClick={() => setSidebarOpen(true)}><span className="dashboard-body__bar-icon"><i className="fas fa-bars" /></span></button>
            <h6 className="title"> {title} </h6>
          </div>
          <div className="user-info">
            <div className="user-info__right">
              <div className="notification"><a className="notification-link" href={`/${role === 'user' ? 'freelancer' : 'buyer'}/messages`}><i className="las la-envelope" /></a></div>
              <div className="user-info__button" onClick={() => setMenu(!menu)}><div className="user-info__thumb"><img src={userImage(undefined)} alt="" /></div></div>
            </div>
            <ul className="user-info-dropdown" style={menu ? { display: 'block' } : undefined}>
              <div className="profile-icon mb-2"><div className="name">{fullName({ firstname: me?.name })}</div><div className="role">{role === 'user' ? 'Freelancer' : 'Buyer'}</div></div>
              {role === 'user' && <li className="user-info-dropdown__item"><a className="user-info-dropdown__link" href="/freelancer/profile"><span className="icon"><i className="fas fa-user-circle" /></span><span className="text">My Profile</span></a></li>}
              <li className="user-info-dropdown__item"><a className="user-info-dropdown__link" href="#" onClick={logout}><span className="icon"><i className="fas fa-cog" /></span><span className="text">Logout</span></a></li>
            </ul>
          </div>
        </div></div>
        <div className="dashboard-body">{children}</div>
      </div>
    </div>
      {sidebarOpen && <button type="button" aria-label="Close dashboard menu" className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
