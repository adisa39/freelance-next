import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Bid, Project } from '@/models/Marketplace';

export const GET = route(async () => {
  const u = await requireUser('user');
  const [pending, running, completed] = await Promise.all([
    Bid.countDocuments({ user: u._id, status: S.BID.PENDING }),
    Project.countDocuments({ user: u._id, status: { $in: [S.PROJECT.RUNNING, S.PROJECT.BUYER_REVIEW] } }),
    Project.countDocuments({ user: u._id, status: S.PROJECT.COMPLETED }),
  ]);
  return ok({ balance: u.balance, earning: u.earning, avgRating: u.avgRating, pendingBids: pending, runningProjects: running, completedProjects: completed });
});
