import { route, ok, notFound } from '@/lib/api';
import { S } from '@/lib/constants';
import { Job, Bid, Project } from '@/models/Marketplace';

export const GET = route(async (_req, ctx) => {
  const { slug } = await ctx.params;
  const job = await Job.findOne({ slug, status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED })
    .populate(['category', 'subcategory', { path: 'skillIds', select: 'name' }, { path: 'buyer', select: 'username firstname lastname avgRating createdAt' }]).lean();
  if (!job) throw notFound('Job not found');
  const buyerId = (job.buyer as { _id: unknown })._id;
  const [bidsCount, total, done] = await Promise.all([
    Bid.countDocuments({ job: job._id }), Project.countDocuments({ buyer: buyerId }), Project.countDocuments({ buyer: buyerId, status: S.PROJECT.COMPLETED }),
  ]);
  const similar = await Job.find({ _id: { $ne: job._id }, status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, category: job.category._id, deadline: { $gt: new Date() } }).limit(5).select('title slug budget').lean();
  return ok({ job, bidsCount, buyerStats: { projects: total, completed: done, successPercent: total ? (done / total) * 100 : 0 }, similar });
});
