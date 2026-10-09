import { route, forbidden, notFound } from '@/lib/api';
import { readSession } from '@/lib/auth';
import { MIME, readUpload } from '@/lib/upload';
import { Conversation, Message } from '@/models/Marketplace';

export const GET = route(async (_req, ctx) => {
  const { id, index } = await ctx.params;
  const s = await readSession();
  const m = await Message.findById(id);
  const rel = m?.files?.[Number(index)];
  if (!m || !rel) throw notFound('File not found');
  const c = await Conversation.findById(m.conversation);
  if (!s || !c || !(s.role === 'admin' || String(c.user) === s.id || String(c.buyer) === s.id)) throw forbidden();
  const ext = rel.split('.').pop()!;
  const buf = await readUpload(rel);
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Content-Disposition': `attachment; filename="attachment-${index}.${ext}"` } });
});
