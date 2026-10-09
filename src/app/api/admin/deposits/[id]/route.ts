import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { approveDeposit, rejectDeposit } from '@/lib/services/finance';

export const POST = route(async (req, ctx) => {
  await requireUser('admin');
  const { id } = await ctx.params;
  const d = z.object({ action: z.enum(['approve', 'reject']), feedback: z.string().optional() }).parse(await req.json());
  await (d.action === 'approve' ? approveDeposit : rejectDeposit)(id, d.feedback);
  return ok();
});
