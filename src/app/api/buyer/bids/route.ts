import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { Bid } from '@/models/Marketplace';

/** GET /api/buyer/bids?job=<id>&sort=updatedAt|isShortlist&order=asc|desc&status= */
export const GET = route(async (req) => {
  const b = await requireUser('buyer');
  const sp = new URL(req.url).searchParams;
  const f: Record<string, unknown> = { buyer: b._id };
  if (sp.get('job')) f.job = sp.get('job');
  if (sp.get('status')) f.status = Number(sp.get('status'));
  const sortKey = ['updatedAt', 'isShortlist', 'createdAt'].includes(sp.get('sort') ?? '') ? sp.get('sort')! : 'createdAt';
  const dir = sp.get('order') === 'asc' ? 1 : -1;
  return ok(await paginate(req, Bid, f, { sort: { [sortKey]: dir }, populate: [{ path: 'job', select: 'title slug budget customBudget' }, { path: 'user', select: 'username firstname lastname avgRating tagline' }] }));
});
