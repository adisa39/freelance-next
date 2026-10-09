import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { makeTrx } from '@/lib/api';
import { paginate } from '@/lib/paginate';
import { SupportTicket } from '@/models/Misc';
import { notify } from '@/lib/notify';

export const GET = route(async (req) => {
  const { role, acct } = await requireParty();
  return ok(await paginate(req, SupportTicket, { ownerRole: role, owner: String(acct._id) }, { select: '-messages' }));
});

export const POST = route(async (req) => {
  const { role, acct } = await requireParty();
  const d = z.object({ subject: z.string().min(1), message: z.string().min(1), priority: z.coerce.number().int().min(1).max(3).default(2) }).parse(await req.json());
  const t = await SupportTicket.create({ ownerRole: role, owner: String(acct._id), ticket: makeTrx(), subject: d.subject, priority: d.priority, messages: [{ senderRole: role, message: d.message }] });
  await notify('admin', 'all', 'New support ticket', d.subject, '/admin/tickets');
  return ok(t, 201);
});
