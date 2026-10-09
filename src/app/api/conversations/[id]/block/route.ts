import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { Conversation } from '@/models/Marketplace';

export const POST = route(async (_req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const c = await Conversation.findOne({ _id: id, buyer: b._id });
  if (!c) throw notFound('Conversation not found');
  c.blocked = !c.blocked; await c.save();
  return ok({ blocked: c.blocked });
});
