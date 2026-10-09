import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { paginate } from '@/lib/paginate';
import { notify } from '@/lib/notify';
import { SupportTicket } from '@/models/Misc';

export const GET = route(async (req) => {
  await requireUser('admin');
  return ok(await paginate(req, SupportTicket, {}, {}));
});

/** POST {id, message?, close?} — admin reply/close */
export const POST = route(async (req) => {
  await requireUser('admin');
  const d = z.object({ id: z.string(), message: z.string().optional(), close: z.boolean().optional() }).parse(await req.json());
  const t = await SupportTicket.findById(d.id); if (!t) throw notFound('Ticket not found');
  if (d.close) t.status = S.TICKET.CLOSE;
  else if (d.message) { t.messages.push({ senderRole: 'admin', message: d.message }); t.status = S.TICKET.ANSWER; await notify(t.ownerRole, t.owner, 'Support reply', t.subject); }
  await t.save(); return ok(t);
});
