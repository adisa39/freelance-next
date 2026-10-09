import { route, notFound } from '@/lib/api';
import { MIME, readUpload } from '@/lib/upload';

/** Public images (profile photos, portfolio, badges) stored under UPLOAD_DIR/<kind>/<name>. */
export const GET = route(async (_req, ctx) => {
  const { kind, name } = await ctx.params;
  if (!['profile', 'portfolio', 'badge'].includes(kind) || !/^[\w.-]+$/.test(name)) throw notFound();
  try {
    const buf = await readUpload(`${kind}/${name}`);
    return new Response(new Uint8Array(buf), { headers: { 'Content-Type': MIME[name.split('.').pop()!.toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' } });
  } catch { throw notFound(); }
});
