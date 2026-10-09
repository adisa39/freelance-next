import { z } from 'zod';
import { route, ok, notFound } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { Conversation, Message, Project } from '@/models/Marketplace';

export const POST = route(async (req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const { report_reason } = z.object({ report_reason: z.string().min(1) }).parse(await req.json());
  const project = await Project.findOneAndUpdate({ _id: id, buyer: b._id, status: S.PROJECT.BUYER_REVIEW }, { status: S.PROJECT.REPORTED, reportReason: report_reason }, { new: true }).populate('job', 'title');
  if (!project) throw notFound('Project not found');
  const convo = await Conversation.findOneAndUpdate({ buyer: b._id, user: project.user }, { $setOnInsert: { job: project.job._id } }, { upsert: true, new: true });
  await Message.create({ conversation: convo._id, senderRole: 'buyer', sender: String(b._id), message: `REPORTED:: ${report_reason}`, buyerReadAt: new Date() });
  await notify('user', project.user, 'Project reported', `The buyer reported "${project.job.title}": ${report_reason}`);
  await notify('admin', 'all', 'Project reported', `${b.username} reported a project`, `/admin/projects`);
  return ok();
});
