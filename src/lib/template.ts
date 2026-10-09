/** Helpers mirroring Laravel's frontendImage()/siteLogo()/getImage()/showAmount() so markup ports 1:1. */
export const asset = (p: string) => `/assets/${p.replace(/^\/+/, '')}`;
export const frontendImage = (section: string, name?: string | null) => (name ? asset(`images/frontend/${section}/${name}`) : asset('images/default.png'));
export const siteLogo = (type?: 'dark') => asset(`images/logo_icon/${type ? `logo_${type}` : 'logo'}.png`);
export const userImage = (img?: string | null) => (img ? `/api/uploads/profile/${img}` : asset('images/user/avatar.png'));
export const showAmount = (n?: number | null, sym = '$', decimals = 2) =>
  `${sym}${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
export const strLimit = (s = '', n = 10) => (s.length > n ? `${s.slice(0, n).trimEnd()}...` : s);

/** Port of assets/templates/basic/css/color.php — returns the :root overrides for the configured theme colors. */
export function hexToHsl(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let hue = d === 0 ? 0 : max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue = Math.round(hue * 60); if (hue < 0) hue += 360;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: hue, s: Math.round(s * 100), l: Math.round(l * 100) };
}
export function themeCss(base: string, second: string) {
  const ok = (c: string) => /^[a-f0-9]{6}$/i.test(c);
  const a = hexToHsl(ok(base) ? base : '336699'), b = hexToHsl(ok(second) ? second : '336699');
  return `:root{--base-h:${a.h};--base-s:${a.s}%;--base-l:${a.l}%;--base-two-h:${b.h};--base-two-s:${b.s}%;--base-two-l:${b.l}%;}`;
}
