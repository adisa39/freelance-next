import { z } from 'zod';
import { route, ok, bad, notFound, ApiError } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { paginate } from '@/lib/paginate';
import { Bid, Job } from '@/models/Marketplace';
import { Buyer } from '@/models/Buyer';

export const GET = route(async (req) => {
  const u = await requireUser('user');
  return ok(await paginate(req, Bid, { user: u._id }, { populate: [{ path: 'job', select: 'title slug budget' }, { path: 'buyer', select: 'username firstname lastname' }] }));
});

const schema = z.object({
  jobId: z.string(),
  bidAmount: z.coerce.number().gt(0).optional(),
  estimatedTime: z.string().min(1).max(40, "Estimated time text can't be more than 40 characters"),
  bidQuote: z.string().min(1),
});

/** Port of User\BidController@storeBid */
export const POST = route(async (req) => {
  const u = await requireUser('user');
  const d = schema.parse(await req.json());
  const job = await Job.findOne({ _id: d.jobId, status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.APPROVED, deadline: { $gt: new Date() } });
  if (!job) throw notFound('Job not found or closed');
  if (!(await Buyer.exists({ _id: job.buyer, status: S.USER.ACTIVE }))) throw notFound('Job not found');
  if (!u.workProfileComplete) throw new ApiError(409, 'Please complete your profile first!');
  if (job.customBudget && !d.bidAmount) throw bad('Bid amount is required for this job');
  try {
    const bid = await Bid.create({ job: job._id, user: u._id, buyer: job.buyer, bidAmount: job.customBudget ? d.bidAmount : job.budget, estimatedTime: d.estimatedTime, bidQuote: d.bidQuote });
    await notify('buyer', job.buyer, 'New bid', `${u.firstname} ${u.lastname} bid on "${job.title}"`, `/buyer/jobs/${job._id}/bids`);
    return ok(bid, 201);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw bad('You have already placed a bid on this job. Duplicate bids are not allowed!');
    throw e;
  }
});
