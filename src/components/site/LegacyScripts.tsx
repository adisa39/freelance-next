'use client';
import { useEffect } from 'react';

const SCRIPTS = [
  '/assets/global/js/jquery-3.7.1.min.js', '/assets/global/js/bootstrap.bundle.min.js', '/assets/global/js/select2.min.js',
  '/assets/templates/basic/js/odometer.min.js', '/assets/templates/basic/js/viewport.jquery.js',
  '/assets/templates/basic/js/slick.min.js', '/assets/templates/basic/js/main.js',
];

/**
 * Loads the template's jQuery stack in the original order *after* React has hydrated, so the jQuery plugins
 * (slick, select2, odometer, nav toggles…) enhance the DOM without causing hydration mismatches.
 * Site links are plain <a> tags (full page loads), exactly like the Laravel app, so these run once per page.
 */
export default function LegacyScripts() {
  useEffect(() => {
    const w = window as unknown as { __legacyLoaded?: boolean; jQuery?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (w.__legacyLoaded) return;
    w.__legacyLoaded = true;
    let cancelled = false;
    const load = (src: string) => new Promise<void>((res) => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = () => res(); s.onerror = () => res(); document.body.appendChild(s); });
    (async () => {
      for (const src of SCRIPTS) { if (cancelled) return; await load(src); }
      const $ = w.jQuery; if (!$) return;
      // frontend layout inline script: highlight words in headings
      $('.s-highlight').each(function (this: HTMLElement) {
        const $h = $(this); const words = $h.text().trim().split(' ');
        const brk = parseInt($h.data('s-break')) || 0, len = parseInt($h.data('s-length')) || 1;
        const start = brk < 0 ? Math.max(0, words.length + brk) : brk; const end = Math.min(words.length, start + len);
        $h.html(words.map((w2: string, i: number) => (i >= start && i < end ? `<span class="text--base">${w2}</span>` : w2)).join(' '));
      });
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}
