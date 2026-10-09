'use client';
import { useEffect, useState } from 'react';

/** Same markup as the Laravel cookie card; appears 2s after load unless already accepted/rejected. */
export default function CookieCard({ text }: { text: string }) {
  const [hidden, setHidden] = useState(true);
  const [gone, setGone] = useState(false);
  useEffect(() => {
    if (document.cookie.includes('gdpr_cookie=')) { setGone(true); return; }
    const t = setTimeout(() => setHidden(false), 2000);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  const dismiss = (e: React.MouseEvent) => { e.preventDefault(); document.cookie = 'gdpr_cookie=1; path=/; max-age=31536000; samesite=lax'; setGone(true); };
  return (
    <div className={`cookies-card text-center${hidden ? ' hide' : ''}`}>
      <div className="cookies-card__icon bg--base"><i className="las la-cookie-bite" /></div>
      <p className="cookies-card__desc">{text} <a className="text--base" href="/cookie-policy" target="_blank" rel="noreferrer">learn more</a></p>
      <div className="cookies-card__btn">
        <a href="#" className="btn btn--base btn--sm policy" onClick={dismiss}>Allow</a>
        <a href="#" className="btn btn-outline--secondary btn--sm policy" onClick={dismiss}>Reject</a>
      </div>
    </div>
  );
}
