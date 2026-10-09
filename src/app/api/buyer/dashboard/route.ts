import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Bid, Job, Project } from '@/models/Marketplace';

export const GET = route(async () => {
  const b = await requireUser('buyer');
  const [jobs, published, bids, running, completed] = await Promise.all([
    Job.countDocuments({ buyer: b._id }), Job.countDocuments({ buyer: b._id, status: S.JOB.PUBLISH }),
    Bid.countDocuments({ buyer: b._id, status: S.BID.PENDING }),
    Project.countDocuments({ buyer: b._id, status: { $in: [S.PROJECT.RUNNING, S.PROJECT.BUYER_REVIEW] } }),
    Project.countDocuments({ buyer: b._id, status: S.PROJECT.COMPLETED }),
  ]);
  return ok({ balance: b.balance, jobs, published, pendingBids: bids, runningProjects: running, completedProjects: completed });
});
