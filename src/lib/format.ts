/** Carbon::diffForHumans(null, true) equivalent (absolute difference, no "ago"/"from now"). */
export function humanDiff(a: string | Date, b: Date = new Date()) {
  let s = Math.abs(new Date(a).getTime() - b.getTime()) / 1000;
  const units: [string, number][] = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [n, sec] of units) { const v = Math.floor(s / sec); if (v >= 1) return `${v} ${n}${v > 1 ? 's' : ''}`; }
  s = Math.floor(s); return `${s} second${s === 1 ? '' : 's'}`;
}
export const jobTimeDifference = (created: string, deadline: string) => `Posted ${humanDiff(created)}, Ends in ${humanDiff(deadline)}`;
export const stripTags = (h = '') => h.replace(/<[^>]*>/g, '');
export const skillLevelLabel = (n: number) => ({ 1: 'Pro Level', 2: 'Expert', 3: 'Intermediate', 4: 'Entry' } as Record<number, string>)[n] ?? 'Entry';
