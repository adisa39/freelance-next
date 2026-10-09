import { z } from 'zod';
import { route, ok } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { Setting } from '@/models/Misc';

export const GET = route(async () => { await requireUser('admin'); return ok(await getSettings()); });

export const PUT = route(async (req) => {
  await requireUser('admin');
  const d = z.object({
    siteName: z.string(), curText: z.string(), curSym: z.string(), escrowPayment: z.boolean(), percentServiceCharge: z.boolean(),
    fixedServiceCharge: z.coerce.number().min(0), jobAutoApproved: z.boolean(), registration: z.boolean(), buyerRegistration: z.boolean(),
  }).partial().parse(await req.json());
  return ok(await Setting.findOneAndUpdate({ key: 'general' }, d, { upsert: true, new: true }));
});
