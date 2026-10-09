import { Types } from 'mongoose';
import { Bid, Job, Project, Review } from '@/models/Marketplace';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { BadgeSetting, Charge } from '@/models/Catalog';
import { Transaction } from '@/models/Finance';
import { ApiError, bad, forbidden, makeTrx, money, notFound } from '../api';
import { S } from '../constants';
import { getSettings } from '../settings';
import { notify } from '../notify';
import { adjustBalance, debitOrThrow, recordTxn } from './wallet';

/** Port of Buyer\ManageJobController@hireTalent */
export async function hireTalent(buyerId: Types.ObjectId, bidId: string) {
  const bid = await Bid.findOne({ _id: bidId, buyer: buyerId, status: S.BID.PENDING }).populate('job');
  if (!bid) throw notFound('Bid not found');
  const job = bid.job as { _id: Types.ObjectId; title: string; customBudget: boolean };
  const cfg = await getSettings();
  const amount = money(bid.bidAmount);

  // Concurrency guard: only one caller can flip PUBLISH -> PROCESSING (prevents double-hiring).
  const locked = await Job.findOneAndUpdate({ _id: job._id, status: S.JOB.PUBLISH }, { status: S.JOB.PROCESSING });
  if (!locked) throw bad('Invalid action! Already hired talent.');

  let postBalance: number | undefined;
  try {
    if (cfg.escrowPayment) {
      postBalance = (await debitOrThrow(Buyer, buyerId, amount, 'Insufficient balance. Please deposit funds to hire this talent.')).balance;
    } else {
      const b = await Buyer.findById(buyerId);
      if (!b || b.balance < amount) throw new ApiError(402, 'Insufficient balance. Please deposit funds to hire this talent.');
    }
  } catch (e) {
    await Job.updateOne({ _id: job._id }, { status: S.JOB.PUBLISH }); // roll back the lock
    throw e;
  }

  const project = await Project.create({
    bid: bid._id, job: job._id, user: bid.user, buyer: buyerId,
    escrowAmount: cfg.escrowPayment ? amount : 0, status: S.PROJECT.RUNNING,
  });
  bid.status = S.BID.ACCEPTED; bid.project = project._id; await bid.save();

  await notify('user', bid.user, 'You were hired', `Your bid on "${job.title}" was accepted.`, `/freelancer/projects/${project._id}`);

  const others = await Bid.find({ job: job._id, status: S.BID.PENDING });
  if (others.length) {
    await Bid.updateMany({ _id: { $in: others.map((b) => b._id) } }, { status: S.BID.REJECTED });
    await Promise.all(others.map((b) => notify('user', b.user, 'Bid rejected', `Another freelancer was hired for "${job.title}".`)));
  }
  if (cfg.escrowPayment && postBalance !== undefined) {
    await recordTxn({ buyer: buyerId, project: project._id, amount, postBalance, trxType: '-', details: `Project hold amount, job: ${job.title}`, remark: 'project_hold_amount' });
  }
  return project;
}

/** Service charge for a freelancer, following the Laravel tier logic (first tier with earning <= tier.amount). */
async function serviceCharge(freelancerEarning: number, bidAmount: number) {
  const cfg = await getSettings();
  let percent = 0;
  if (cfg.percentServiceCharge) {
    const tiers = await Charge.find({ amount: { $ne: null }, percent: { $ne: null } }).sort({ amount: 1 }).lean();
    percent = tiers.find((t) => freelancerEarning <= t.amount)?.percent ?? 0; // no matching tier => 0%, as in the original
  }
  return money((percent ? (bidAmount * percent) / 100 : 0) + (cfg.fixedServiceCharge || 0));
}

/**
 * Port of Buyer\ProjectController@complete (+ Admin completeProject for reported projects).
 * The status flip is an atomic claim, so a project can only be paid out once.
 */
export async function completeProject(opts: { projectId: string; buyerId?: Types.ObjectId; allowed: number[]; rating?: number; review?: string }) {
  const filter: Record<string, unknown> = { _id: opts.projectId, status: { $in: opts.allowed } };
  if (opts.buyerId) filter.buyer = opts.buyerId;
  const project = await Project.findOne(filter);
  if (!project) throw notFound('Project not found');
  const bid = await Bid.findOne({ project: project._id, status: S.BID.ACCEPTED }).populate('job');
  if (!bid) throw bad('Bid not found for this project');
  const job = bid.job as { _id: Types.ObjectId; title: string };
  const amount = money(bid.bidAmount);

  const claimed = await Project.findOneAndUpdate({ _id: project._id, status: { $in: opts.allowed } }, { status: S.PROJECT.COMPLETED });
  if (!claimed) throw bad('Project already processed');

  let buyerPost: number | undefined;
  if (!project.escrowAmount) {
    const b = await adjustBalance(Buyer, project.buyer, -amount);
    if (!b) { await Project.updateOne({ _id: project._id }, { status: project.status }); throw new ApiError(402, 'Insufficient balance for this completed project'); }
    buyerPost = b.balance;
  }
  await Bid.updateOne({ _id: bid._id }, { status: S.BID.COMPLETED });
  await Job.updateOne({ _id: job._id }, { status: S.JOB.COMPLETED });

  const fl = await User.findById(project.user);
  if (!fl) throw notFound('Freelancer not found');
  const charge = await serviceCharge(fl.earning || 0, amount);
  const finalIncome = money(amount - charge);

  if (opts.rating) {
    await Review.findOneAndUpdate({ project: project._id }, { user: fl._id, buyer: project.buyer, rating: opts.rating, review: opts.review }, { upsert: true });
  }
  const [agg] = await Review.aggregate([{ $match: { user: fl._id } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]);

  const after = await User.findByIdAndUpdate(fl._id, { $inc: { balance: finalIncome, earning: finalIncome }, avgRating: agg?.avg ?? 0 }, { new: true });
  const trx = makeTrx();
  await recordTxn({ user: fl._id, project: project._id, amount, postBalance: after!.balance + charge, trxType: '+', details: `Project completed for job ${job.title}`, remark: 'completed_project', trx });
  if (charge > 0) await recordTxn({ user: fl._id, project: project._id, amount: charge, postBalance: after!.balance, trxType: '-', details: `Project completed commission for ${job.title}`, remark: 'commission', trx });

  const badge = await BadgeSetting.findOne({ minAmount: { $lte: after!.earning } }).sort({ minAmount: -1 });
  if (badge && String(badge._id) !== String(after!.badge)) await User.updateOne({ _id: fl._id }, { badge: badge._id });

  if (project.escrowAmount) {
    await Transaction.updateOne({ buyer: project.buyer, project: project._id, remark: 'project_hold_amount' }, { remark: 'completed_project', details: `Project completed for job ${job.title}` });
  } else {
    await recordTxn({ buyer: project.buyer, project: project._id, amount, postBalance: buyerPost!, trxType: '-', details: `Project completed for job ${job.title}`, remark: 'completed_project' });
  }
  await notify('user', fl._id, 'Project completed', `You earned ${finalIncome} (fee ${charge}) for "${job.title}".`, `/freelancer/projects/${project._id}`);
  return { finalIncome, charge };
}

/** Port of Admin\ProjectManagerController@rejectProject — refunds escrow to the buyer. */
export async function rejectReportedProject(projectId: string) {
  const project = await Project.findOneAndUpdate({ _id: projectId, status: S.PROJECT.REPORTED }, { status: S.PROJECT.REJECTED });
  if (!project) throw notFound('Reported project not found');
  const job = await Job.findByIdAndUpdate(project.job, { isApproved: S.JOB_APPROVAL.REJECTED, status: S.JOB.FINISHED });
  if (project.escrowAmount) {
    const b = await adjustBalance(Buyer, project.buyer, project.escrowAmount);
    const hold = await Transaction.findOne({ buyer: project.buyer, project: project._id });
    await recordTxn({ buyer: project.buyer, project: project._id, amount: project.escrowAmount, postBalance: b!.balance, trxType: '+', details: `Reported project rejected, job ${job?.title}`, remark: 'hold_amount_released', trx: hold?.trx });
  }
  await Promise.all([
    notify('buyer', project.buyer, 'Reported project rejected', `Escrow refunded for "${job?.title}".`),
    notify('user', project.user, 'Reported project rejected', `The project for "${job?.title}" was rejected by admin.`),
  ]);
}

export function assertOwner(a: unknown, b: unknown) { if (String(a) !== String(b)) throw forbidden(); }
