import { connectDB } from './db';
import { S } from './constants';
import { Job, Bid, Project, Review } from '@/models/Marketplace';
import { Transaction } from '@/models/Finance';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Category, Skill, BadgeSetting, Subcategory } from '@/models/Catalog';

void Category; void Skill; void BadgeSetting; void Subcategory; // register models for populate()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const plain = (x: unknown): any => JSON.parse(JSON.stringify(x));

/** Bidders for the "Freelancers are bidding on this job" list, with the stats the card shows. */
export async function biddersFor(jobId: string, offset = 0, limit = 5) {
  const bids = await Bid.find({ job: jobId, status: { $ne: S.BID.WITHDRAW } }).sort({ createdAt: -1 }).skip(offset).limit(limit)
    .populate({ path: 'user', populate: [{ path: 'badge', select: 'badgeName' }] }).lean();
  return Promise.all(bids.map(async (b) => {
    const u = b.user as { _id: unknown; [k: string]: unknown };
    const [total, done, reviews, earned] = await Promise.all([
      Project.countDocuments({ user: u._id }), Project.countDocuments({ user: u._id, status: S.PROJECT.COMPLETED }),
      Review.countDocuments({ user: u._id }), Transaction.aggregate([{ $match: { user: u._id } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
    ]);
    return plain({ ...u, jobSuccess: total ? (done / total) * 100 : 0, reviewsCount: reviews, totalEarned: earned[0]?.t ?? 0 });
  }));
}

export async function getJobDetails(slug: string) {
  await connectDB();
  const [buyersOk, catsOk] = await Promise.all([Buyer.find({ status: S.USER.ACTIVE }).distinct('_id'), Category.find({ status: 1 }).distinct('_id')]);
  const job = await Job.findOne({ slug, status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, buyer: { $in: buyersOk }, category: { $in: catsOk } }).populate('skillIds', 'name').populate('buyer').lean();
  if (!job) return null;
  const buyerId = (job.buyer as { _id: unknown })._id;
  const [bidsCount, total, done, jobsPosted, totalBidders, similar, skillTop] = await Promise.all([
    Bid.countDocuments({ job: job._id }), Project.countDocuments({ buyer: buyerId }), Project.countDocuments({ buyer: buyerId, status: S.PROJECT.COMPLETED }),
    Job.countDocuments({ buyer: buyerId }), Bid.countDocuments({ job: job._id, status: { $ne: S.BID.WITHDRAW } }),
    Job.find({ _id: { $ne: job._id }, status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, category: job.category, subcategory: job.subcategory, deadline: { $gt: new Date() } }).sort({ createdAt: -1 }).limit(6).lean(),
    Job.aggregate([{ $match: { status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED } }, { $unwind: '$skillIds' }, { $group: { _id: '$skillIds', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
  ]);
  const skills = await Skill.find({ _id: { $in: skillTop.map((s) => s._id) } }).select('name').lean();
  const topSkills = skillTop.map((s) => ({ name: skills.find((x) => String(x._id) === String(s._id))?.name ?? '', count: s.count }));
  const bidders = await biddersFor(String(job._id));
  return plain({ job: { ...job, bidsCount }, buyerStats: { done, percent: total ? (done / total) * 100 : 0 }, jobsPosted, totalBidders, similar: similar.slice(0, 5), totalSimilar: similar.length, topSkills, bidders });
}

const hasDb = () => !!process.env.MONGODB_URI && process.env.CMS_SOURCE !== 'json';

/** Port of JobExploreController@allFreelancers */
export async function listTalents(q: { rating?: string; skill?: string; search?: string; page?: number }, size = 12) {
  if (!hasDb()) return { items: [], total: 0, pages: 1, skills: [] };
  try {
    await connectDB();
    const f: Record<string, unknown> = { status: S.USER.ACTIVE };
    if (q.rating && Number(q.rating) > 0) f.avgRating = { $gte: Number(q.rating) };
    if (q.skill) f.skillIds = q.skill;
    if (q.search) f.$or = ['firstname', 'lastname', 'username', 'tagline'].map((k) => ({ [k]: { $regex: q.search!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }));
    const page = Math.max(1, q.page ?? 1);
    const [total, rows, skills] = await Promise.all([User.countDocuments(f), User.find(f).sort({ earning: -1, avgRating: -1 }).skip((page - 1) * size).limit(size).populate('skillIds', 'name').populate('badge', 'badgeName').lean(), Skill.find({ status: 1 }).sort({ name: 1 }).lean()]);
    return { items: plain(rows), total, pages: Math.max(1, Math.ceil(total / size)), skills: plain(skills) };
  } catch { return { items: [], total: 0, pages: 1, skills: [] }; }
}

/** Port of JobExploreController@exploreFreelancer */
export async function getTalent(username: string) {
  if (!hasDb()) return null;
  await connectDB();
  const f = await User.findOne({ username: username.toLowerCase(), status: S.USER.ACTIVE }).populate('skillIds', 'name').populate('badge').lean();
  if (!f) return null;
  const [total, done, reviews, similar, topSkillsAgg] = await Promise.all([
    Project.countDocuments({ user: f._id }), Project.countDocuments({ user: f._id, status: S.PROJECT.COMPLETED }),
    Review.find({ user: f._id }).sort({ createdAt: -1 }).limit(10).populate('buyer', 'firstname lastname countryName').lean(),
    User.find({ _id: { $ne: f._id }, status: S.USER.ACTIVE, skillIds: { $in: (f.skillIds as { _id: unknown }[]).map((s) => s._id) } }).limit(3).populate('skillIds', 'name').populate('badge', 'badgeName').lean(),
    Job.aggregate([{ $match: { status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED } }, { $unwind: '$skillIds' }, { $group: { _id: '$skillIds', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
  ]);
  const sk = await Skill.find({ _id: { $in: topSkillsAgg.map((s) => s._id) } }).select('name').lean();
  return plain({ f, jobSuccess: total ? (done / total) * 100 : 0, done, reviews, similar, topSkills: topSkillsAgg.map((s) => ({ name: sk.find((x) => String(x._id) === String(s._id))?.name ?? '', count: s.count })) });
}
