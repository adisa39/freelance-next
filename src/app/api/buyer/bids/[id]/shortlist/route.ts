import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { Bid } from '@/models/Marketplace';

export const POST = route(async (_req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const bid = await Bid.findOne({ _id: id, buyer: b._id });
  if (!bid) throw notFound('Bid not found');
  bid.isShortlist = !bid.isShortlist; await bid.save();
  return ok({ shortlisted: bid.isShortlist });
});
