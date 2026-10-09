import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireParty } from '@/lib/auth';
import { requestWithdrawal } from '@/lib/services/finance';

export const POST = route(async (req) => {
  const { role, acct } = await requireParty();
  const d = z.object({ methodId: z.string(), amount: z.coerce.number().gt(0), info: z.record(z.string(), z.unknown()).default({}) }).parse(await req.json());
  return ok(await requestWithdrawal(role, acct, d.methodId, d.amount, d.info), 201);
});
