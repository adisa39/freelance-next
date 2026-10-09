import { route, ok } from '@/lib/api';
import { S } from '@/lib/constants';
import { Job } from '@/models/Marketplace';
import { Buyer } from '@/models/Buyer';
import { Category, Subcategory } from '@/models/Catalog';

/** Counts for the filter sidebar (Laravel: withCount('jobs') + getJobCounts()). */
export const GET = route(async () => {
  const [buyers, cats] = await Promise.all([Buyer.find({ status: S.USER.ACTIVE }).distinct('_id'), Category.find({ status: 1 }).distinct('_id')]);
  const base = { status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, deadline: { $gt: new Date() }, buyer: { $in: buyers }, category: { $in: cats } };
  const count = (k: string) => Job.aggregate([{ $match: base }, { $group: { _id: `$${k}`, n: { $sum: 1 } } }]);
  const [byCat, bySub, byScope, byLevel] = await Promise.all([count('category'), count('subcategory'), count('projectScope'), count('skillLevel')]);
  const m = (a: { _id: unknown; n: number }[]) => new Map(a.map((x) => [String(x._id), x.n]));
  const mc = m(byCat), ms = m(bySub), mp = m(byScope), ml = m(byLevel);
  const [categories, subcategories] = await Promise.all([Category.find({ _id: { $in: [...mc.keys()] }, status: 1 }).lean(), Subcategory.find({ _id: { $in: [...ms.keys()] }, status: 1 }).lean()]);
  return ok({
    categories: categories.map((c) => ({ _id: c._id, name: c.name, jobsCount: mc.get(String(c._id)) ?? 0 })),
    subcategories: subcategories.map((c) => ({ _id: c._id, name: c.name, jobsCount: ms.get(String(c._id)) ?? 0 })),
    counting: { large: mp.get('1') ?? 0, medium: mp.get('2') ?? 0, small: mp.get('3') ?? 0, pro: ml.get('1') ?? 0, expert: ml.get('2') ?? 0, intermediate: ml.get('3') ?? 0, entry: ml.get('4') ?? 0 },
  });
});
