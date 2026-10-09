import { route, ok, escapeRegex } from '@/lib/api';
import { S } from '@/lib/constants';
import { paginate } from '@/lib/paginate';
import { Job, Bid } from '@/models/Marketplace';
import { Buyer } from '@/models/Buyer';
import { Category } from '@/models/Catalog';

/** Public marketplace list — port of JobExploreController@freelanceJobs/filterJobs. */
export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams;
  const [activeBuyers, activeCats] = await Promise.all([
    Buyer.find({ status: S.USER.ACTIVE }).distinct('_id'),
    Category.find({ status: 1 }).distinct('_id'),
  ]);
  const f: Record<string, unknown> = {
    status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, deadline: { $gt: new Date() },
    buyer: { $in: activeBuyers }, category: { $in: activeCats },
  };
  // Parameter names follow Laravel's filterJobs (search, category_id, subcategory_id[], project_scope[], skill_level[], min_budget, max_budget)
  const multi = (...k: string[]) => k.flatMap((x) => sp.getAll(x).concat(sp.getAll(x + '[]'))).flatMap((v) => v.split(',')).filter(Boolean);
  const q = sp.get('search') || sp.get('q');
  if (q) f.title = { $regex: escapeRegex(q), $options: 'i' };
  const cat = sp.get('category_id') || sp.get('category'); if (cat) f.category = cat;
  const bu = multi('subcategory_id', 'subcategory'); if (bu.length) f.subcategory = { $in: bu };
  const sc = multi('project_scope', 'scope'); if (sc.length) f.projectScope = { $in: sc.map(Number) };
  const lv = multi('skill_level', 'level'); if (lv.length) f.skillLevel = { $in: lv.map(Number) };
  const min = Number(sp.get('min_budget') ?? sp.get('min')), max = Number(sp.get('max_budget') ?? sp.get('max'));
  if (min || max) f.budget = { ...(min ? { $gte: min } : {}), ...(max ? { $lte: max } : {}) };
  const bun = sp.get('buyer'); if (bun) { const b = await Buyer.findOne({ username: bun.toLowerCase() }).select('_id'); if (b) f.buyer = b._id; }

  const res = await paginate(req, Job, f, { populate: ['category', 'subcategory', { path: 'skillIds', select: 'name' }, { path: 'buyer', select: 'username firstname lastname avgRating' }] });
  const counts = await Bid.aggregate([{ $match: { job: { $in: res.items.map((j) => j._id) } } }, { $group: { _id: '$job', n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return ok({ ...res, items: res.items.map((j) => ({ ...j, bidsCount: map.get(String(j._id)) ?? 0 })) });
});
