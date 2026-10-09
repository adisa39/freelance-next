import { route, ok, bad, slugify, escapeRegex } from '@/lib/api';
import { jobSchema, validateJobRefs } from '@/lib/jobs';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { getSettings } from '@/lib/settings';
import { paginate } from '@/lib/paginate';
import { Job, Bid } from '@/models/Marketplace';

export const GET = route(async (req) => {
  const b = await requireUser('buyer');
  const sp = new URL(req.url).searchParams;
  const f: Record<string, unknown> = { buyer: b._id };
  if (sp.get('q')) f.title = { $regex: escapeRegex(sp.get('q')!), $options: 'i' };
  if (sp.get('status')) f.status = Number(sp.get('status'));
  const res = await paginate(req, Job, f, { populate: ['category'] });
  const counts = await Bid.aggregate([{ $match: { job: { $in: res.items.map((j) => j._id) } } }, { $group: { _id: '$job', n: { $sum: 1 } } }]);
  const m = new Map(counts.map((c) => [String(c._id), c.n]));
  return ok({ ...res, items: res.items.map((j) => ({ ...j, bidsCount: m.get(String(j._id)) ?? 0 })) });
});

export const POST = route(async (req) => {
  const b = await requireUser('buyer');
  const d = jobSchema.parse(await req.json());
  await validateJobRefs(d);
  const slug = slugify(d.slug || d.title);
  if (await Job.exists({ slug })) throw bad('Slug already in use — choose another');
  const cfg = await getSettings();
  const job = await Job.create({ ...d, slug, buyer: b._id, isApproved: d.status === S.JOB.PUBLISH && cfg.jobAutoApproved ? S.JOB_APPROVAL.APPROVED : S.JOB_APPROVAL.PENDING });
  return ok(job, 201);
});
