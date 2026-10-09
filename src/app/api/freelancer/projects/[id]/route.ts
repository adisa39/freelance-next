import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { Project, Review, BuyerReview } from '@/models/Marketplace';

export const GET = route(async (_req, ctx) => {
  const u = await requireUser('user');
  const { id } = await ctx.params;
  const project = await Project.findOne({ _id: id, user: u._id })
    .populate([{ path: 'job', select: 'title slug description' }, { path: 'buyer', select: 'username firstname lastname avgRating' }, { path: 'bid', select: 'bidAmount estimatedTime' }]).lean();
  if (!project) throw notFound('Project not found');
  const [review, buyerReview] = await Promise.all([Review.findOne({ project: id }).lean(), BuyerReview.findOne({ project: id }).lean()]);
  return ok({ ...project, review, buyerReview });
});
