import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { Job } from '@/models/Marketplace';

/** POST {action:'approve'|'reject'} */
export const POST = route(async (req, ctx) => {
  await requireUser('admin');
  const { id } = await ctx.params;
  const { action } = z.object({ action: z.enum(['approve', 'reject']) }).parse(await req.json());
  const job = await Job.findByIdAndUpdate(id, { isApproved: action === 'approve' ? S.JOB_APPROVAL.APPROVED : S.JOB_APPROVAL.REJECTED }, { new: true });
  if (!job) throw notFound('Job not found');
  await notify('buyer', job.buyer, `Job ${action === 'approve' ? 'approved' : 'rejected'}`, job.title, `/buyer/jobs/${job._id}`);
  return ok(job);
});
