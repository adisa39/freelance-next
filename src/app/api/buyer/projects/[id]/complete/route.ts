import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { S } from '@/lib/constants';
import { completeProject } from '@/lib/services/marketplace';

const schema = z.object({ rating: z.coerce.number().int().min(1).max(5), review: z.string().min(1) });

export const POST = route(async (req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  const d = schema.parse(await req.json());
  return ok(await completeProject({ projectId: id, buyerId: b._id, allowed: [S.PROJECT.BUYER_REVIEW], ...d }));
});
