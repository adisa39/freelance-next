import cms from '@/data/cms.json';
import { connectDB } from './db';
import { Frontend, PageDoc } from '@/models/Cms';
import { Setting } from '@/models/Misc';

export type Dv = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type Row = { id: number; dataKeys: string; dataValues: Dv; slug?: string | null };

const seed = cms as unknown as { frontends: Row[]; pages: { name: string; slug: string; secs: string[]; isDefault: number }[]; settings: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
const useDb = () => process.env.CMS_SOURCE !== 'json' && !!process.env.MONGODB_URI;

let cache: { at: number; rows: Row[] } | null = null;
async function allRows(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < 15_000) return cache.rows;
  let rows: Row[] = seed.frontends;
  if (useDb()) {
    try { await connectDB(); const db = await Frontend.find().sort({ id: 1 }).lean(); if (db.length) rows = db as unknown as Row[]; } catch { /* fall back to bundled CMS data */ }
  }
  cache = { at: Date.now(), rows };
  return rows;
}

/** Port of Laravel getContent(): single => latest row; list => id desc (or asc with orderById), optional limit. */
export async function getContent(key: string, single: true): Promise<Dv>;
export async function getContent(key: string, single?: false, limit?: number | null, orderById?: boolean): Promise<Row[]>;
export async function getContent(key: string, single = false, limit: number | null = null, orderById = false): Promise<Dv | Row[]> {
  const rows = (await allRows()).filter((r) => r.dataKeys === key).sort((a, b) => (orderById ? a.id - b.id : b.id - a.id));
  if (single) return rows[0]?.dataValues ?? {};
  return limit ? rows.slice(0, limit) : rows;
}

export async function getPages() {
  let pages = seed.pages;
  if (useDb()) { try { await connectDB(); const db = await PageDoc.find().lean(); if (db.length) pages = db as unknown as typeof pages; } catch { /* bundled */ } }
  return pages;
}
export async function getPage(slug: string) { return (await getPages()).find((p) => p.slug === slug); }

export async function getSiteSettings() {
  let s = { ...seed.settings };
  if (useDb()) { try { await connectDB(); const d = await Setting.findOne({ key: 'general' }).lean(); if (d?.siteName) s = { ...s, siteName: d.siteName, curText: d.curText ?? s.curText, curSym: d.curSym ?? s.curSym }; } catch { /* bundled */ } }
  return s;
}
