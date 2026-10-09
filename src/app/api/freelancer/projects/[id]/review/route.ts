import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Project, BuyerReview } from '@/models/Marketplace';
import { Buyer } from '@/models/Buyer';

/** Freelancer rates the buyer after completion (User\ProjectController@storeReviewRating). */
export const POST = route(async (req, ctx) => {
  const u = await requireUser('user');
  const { id } = await ctx.params;
  const d = z.object({ rating: z.coerce.number().int().min(1).max(5), review: z.string().min(1) }).parse(await req.json());
  const project = await Project.findOne({ _id: id, user: u._id, status: S.PROJECT.COMPLETED });
  if (!project) throw notFound('Project not found');
  const r = await BuyerReview.findOneAndUpdate({ project: id, user: u._id }, { ...d, buyer: project.buyer }, { upsert: true, new: true });
  const [agg] = await BuyerReview.aggregate([{ $match: { buyer: project.buyer } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]);
  await Buyer.updateOne({ _id: project.buyer }, { avgRating: agg?.avg ?? 0 });
  return ok(r);
});
