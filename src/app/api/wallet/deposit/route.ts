import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { createManualDeposit } from '@/lib/services/finance';

export const POST = route(async (req) => {
  const b = await requireUser('buyer'); // only buyers fund the escrow wallet
  const d = z.object({ methodId: z.string(), amount: z.coerce.number().gt(0), info: z.record(z.string(), z.unknown()).default({}) }).parse(await req.json());
  return ok(await createManualDeposit(b._id, d.methodId, d.amount, d.info), 201);
});
