import { route, ok, escapeRegex } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { paginate } from '@/lib/paginate';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';

/** ?role=user|buyer&q=&status= */
export const GET = route(async (req) => {
  await requireUser('admin');
  const sp = new URL(req.url).searchParams;
  const M = sp.get('role') === 'buyer' ? Buyer : User;
  const f: Record<string, unknown> = {};
  if (sp.get('status')) f.status = Number(sp.get('status'));
  if (sp.get('q')) { const r = { $regex: escapeRegex(sp.get('q')!), $options: 'i' }; f.$or = [{ username: r }, { email: r }, { firstname: r }, { lastname: r }]; }
  return ok(await paginate(req, M, f, { select: '-password' }));
});
