import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Project, Review, BuyerReview } from '@/models/Marketplace';

export const GET = route(async (_req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const project = await Project.findOne({ _id: id, buyer: b._id, status: { $ne: S.PROJECT.REJECTED } })
    .populate([{ path: 'job', select: 'title slug description' }, { path: 'user', select: 'username firstname lastname avgRating' }, { path: 'bid', select: 'bidAmount estimatedTime bidQuote' }]).lean();
  if (!project) throw notFound('Project not found');
  const [review, buyerReview] = await Promise.all([Review.findOne({ project: id }).lean(), BuyerReview.findOne({ project: id }).lean()]);
  return ok({ ...project, review, buyerReview });
});
