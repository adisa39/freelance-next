import { route, forbidden, notFound } from '@/lib/api';
import { readSession } from '@/lib/auth';
import { MIME, readUpload } from '@/lib/upload';
import { Project } from '@/models/Marketplace';

/** Authenticated download — only the project's buyer, freelancer or an admin. */
export const GET = route(async (_req, ctx) => {
  const { id } = await ctx.params;
  const s = await readSession();
  const p = await Project.findById(id);
  if (!p || !p.projectFile) throw notFound('File not found');
  const allowed = s && (s.role === 'admin' || String(p.user) === s.id || String(p.buyer) === s.id);
  if (!allowed) throw forbidden();
  const ext = p.projectFile.split('.').pop()!;
  const buf = await readUpload(p.projectFile);
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Content-Disposition': `attachment; filename="project-${id}.${ext}"` } });
});
