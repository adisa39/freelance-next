import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { S } from '@/lib/constants';
import { SupportTicket } from '@/models/Misc';

async function mine(id: string) {
  const { role, acct } = await requireParty();
  const t = await SupportTicket.findOne({ _id: id, ownerRole: role, owner: String(acct._id) });
  if (!t) throw notFound('Ticket not found');
  return { t, role };
}
export const GET = route(async (_req, ctx) => ok((await mine((await ctx.params).id)).t));

/** POST {message} replies; POST {close:true} closes. */
export const POST = route(async (req, ctx) => {
  const { t, role } = await mine((await ctx.params).id);
  const d = z.object({ message: z.string().optional(), close: z.boolean().optional() }).parse(await req.json());
  if (d.close) t.status = S.TICKET.CLOSE;
  else if (d.message) { t.messages.push({ senderRole: role, message: d.message }); t.status = S.TICKET.REPLY; }
  await t.save();
  return ok(t);
});
