import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { hireTalent } from '@/lib/services/marketplace';

export const POST = route(async (_req, ctx) => {
  const b = await requireUser('buyer');
  const { id } = await ctx.params;
  return ok(await hireTalent(b._id, id));
});
