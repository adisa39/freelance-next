import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { Job, Project } from '@/models/Marketplace';
import { Deposit, Withdrawal } from '@/models/Finance';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { SupportTicket } from '@/models/Misc';

export const GET = route(async () => {
  await requireUser('admin');
  const [freelancers, buyers, jobsPending, reported, depositsPending, withdrawalsPending, tickets, depositSum] = await Promise.all([
    User.countDocuments(), Buyer.countDocuments(),
    Job.countDocuments({ status: S.JOB.PUBLISH, isApproved: S.JOB_APPROVAL.PENDING }),
    Project.countDocuments({ status: S.PROJECT.REPORTED }),
    Deposit.countDocuments({ status: S.PAYMENT.PENDING }), Withdrawal.countDocuments({ status: S.PAYMENT.PENDING }),
    SupportTicket.countDocuments({ status: { $in: [S.TICKET.OPEN, S.TICKET.REPLY] } }),
    Deposit.aggregate([{ $match: { status: S.PAYMENT.SUCCESS } }, { $group: { _id: null, t: { $sum: '$amount' } } }]),
  ]);
  return ok({ freelancers, buyers, jobsPending, reportedProjects: reported, depositsPending, withdrawalsPending, openTickets: tickets, totalDeposited: depositSum[0]?.t ?? 0 });
});
