import { route, ok } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { PayMethod } from '@/models/Finance';

export const GET = route(async (req) => {
  await requireParty();
  const kind = new URL(req.url).searchParams.get('kind') === 'withdraw' ? 'withdraw' : 'deposit';
  return ok(await PayMethod.find({ kind, status: 1 }).lean());
});
