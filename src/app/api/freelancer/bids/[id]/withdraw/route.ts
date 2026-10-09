import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { Bid } from '@/models/Marketplace';

export const POST = route(async (_req, ctx) => {
  const u = await requireUser('user');
  const { id } = await ctx.params;
  const bid = await Bid.findOneAndUpdate({ _id: id, user: u._id, status: S.BID.PENDING }, { status: S.BID.WITHDRAW }, { new: true }).populate('job', 'title');
  if (!bid) throw notFound('Bid not found');
  await notify('buyer', bid.buyer, 'Bid withdrawn', `${u.firstname} withdrew their bid on "${bid.job.title}"`);
  return ok();
});
