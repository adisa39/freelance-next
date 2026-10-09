import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Project, Review } from '@/models/Marketplace';
import { User } from '@/models/User';

/** Update the rating/review left on a completed project (Buyer\ProjectController@updateReviewRating). */
export const PUT = route(async (req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const d = z.object({ rating: z.coerce.number().int().min(1).max(5), review: z.string().min(1) }).parse(await req.json());
  const project = await Project.findOne({ _id: id, buyer: b._id, status: S.PROJECT.COMPLETED });
  if (!project) throw notFound('Project not found');
  const r = await Review.findOneAndUpdate({ project: id }, d, { new: true });
  if (!r) throw notFound('Review not existing');
  const [agg] = await Review.aggregate([{ $match: { user: project.user } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]);
  await User.updateOne({ _id: project.user }, { avgRating: agg?.avg ?? 0 });
  return ok(r);
});
