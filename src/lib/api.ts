import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { connectDB } from './db';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const bad = (m: string) => new ApiError(400, m);
export const notFound = (m = 'Not found') => new ApiError(404, m);
export const forbidden = (m = 'Forbidden') => new ApiError(403, m);

export const ok = (data: unknown = {}, status = 200) => NextResponse.json({ ok: true, data }, { status });

type Ctx = { params: Promise<Record<string, string>> };
/** Wraps a route handler: connects DB, maps ApiError / ZodError to JSON responses. */
export function route(fn: (req: Request, ctx: Ctx) => Promise<Response>) {
  return async (req: Request, ctx: Ctx) => {
    try {
      await connectDB();
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ ok: false, error: e.message }, { status: e.status });
      if (e instanceof ZodError) {
        return NextResponse.json({ ok: false, error: e.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 422 });
      }
      console.error(e);
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
  };
}

export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const makeTrx = () => Array.from({ length: 12 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function pageParams(req: Request, defaultSize = 15) {
  const u = new URL(req.url);
  const page = Math.max(1, Number(u.searchParams.get('page') || 1));
  const size = Math.min(100, Number(u.searchParams.get('size') || defaultSize));
  return { page, size, skip: (page - 1) * size, q: u.searchParams.get('q')?.trim() || '', sp: u.searchParams };
}
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
