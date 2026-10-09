'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    const fallback = window.setTimeout(hide, 2500);

    if (document.readyState === 'complete') hide();
    else window.addEventListener('load', hide, { once: true });

    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('load', hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="preloader" role="status" aria-label="Loading page">
      <div className="loader">
        <div className="loader-bar bar-1" />
        <div className="loader-bar bar-2" />
        <div className="loader-bar bar-3" />
        <div className="loader-bar bar-4" />
      </div>
    </div>
  );
}
