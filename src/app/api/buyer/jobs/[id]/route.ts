import { route, ok, bad, notFound, slugify } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { getSettings } from '@/lib/settings';
import { Job } from '@/models/Marketplace';
import { jobSchema, validateJobRefs } from '@/lib/jobs';

export const GET = route(async (_req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const job = await Job.findOne({ _id: id, buyer: b._id }).populate(['category', 'subcategory', { path: 'skillIds', select: 'name' }]).lean();
  if (!job) throw notFound('Job not found');
  return ok(job);
});

export const PUT = route(async (req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const job = await Job.findOne({ _id: id, buyer: b._id });
  if (!job) throw notFound('Job not found');
  // Laravel: only editable until an admin has acted on it
  if (job.isApproved !== S.JOB_APPROVAL.PENDING) throw bad('You are not allowed to edit this job post.');
  const d = jobSchema.parse(await req.json());
  await validateJobRefs(d);
  const slug = slugify(d.slug || d.title);
  if (await Job.exists({ slug, _id: { $ne: job._id } })) throw bad('Slug already in use');
  const cfg = await getSettings();
  job.set({ ...d, slug });
  if (d.status === S.JOB.PUBLISH && cfg.jobAutoApproved) job.isApproved = S.JOB_APPROVAL.APPROVED;
  await job.save();
  return ok(job);
});
