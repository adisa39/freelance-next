import { route, ok } from '@/lib/api';
import { readSession } from '@/lib/auth';
import { User } from '@/models/User';
import { Buyer } from '@/models/Buyer';
import { Admin } from '@/models/Admin';

export const GET = route(async () => {
  const s = await readSession();
  if (!s) return ok(null);
  const M = s.role === 'user' ? User : s.role === 'buyer' ? Buyer : Admin;
  const acct = await M.findById(s.id).lean();
  if (!acct) return ok(null);
  return ok({ role: s.role, id: acct._id, name: acct.name ?? `${acct.firstname ?? ''} ${acct.lastname ?? ''}`.trim(), username: acct.username, balance: acct.balance, avgRating: acct.avgRating, workProfileComplete: acct.workProfileComplete });
});
