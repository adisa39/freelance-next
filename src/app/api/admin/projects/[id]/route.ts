import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { completeProject, rejectReportedProject } from '@/lib/services/marketplace';

/** Resolve a reported project: 'complete' pays the freelancer, 'reject' refunds the buyer's escrow. */
export const POST = route(async (req, ctx) => {
  await requireUser('admin');
  const { id } = await ctx.params;
  const { action } = z.object({ action: z.enum(['complete', 'reject']) }).parse(await req.json());
  if (action === 'complete') return ok(await completeProject({ projectId: id, allowed: [S.PROJECT.REPORTED] }));
  await rejectReportedProject(id);
  return ok();
});
